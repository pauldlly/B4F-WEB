# Déploiement du backend B4F V10

## 1. Sauvegarder la base

Avant la migration, créez une sauvegarde ou un point de restauration Supabase.

La migration ajoute de nouveaux objets et ne remplace pas les RPC de l’application mobile.

## 2. Préparer Supabase CLI

Depuis le dossier du projet :

```powershell
npx supabase login
npx supabase link --project-ref TON_PROJECT_REF
```

Le `project-ref` correspond à la partie située avant `.supabase.co`.

## 3. Appliquer la migration

```powershell
npx supabase db push
```

Migration concernée :

```text
supabase/migrations/20260806143000_public_ticketing_backend.sql
```

Elle crée les tables publiques, les fonctions SQL atomiques, les politiques RLS,
les offres partenaires et la publication Realtime.

## 4. Configurer les secrets Edge Functions

```powershell
npx supabase secrets set `
  SUMUP_API_KEY="TA_CLE_API_SUMUP" `
  SUMUP_MERCHANT_CODE="TON_MERCHANT_CODE" `
  PUBLIC_SITE_URL="https://b4fevents.com"
```

Lorsque le projet Expo Push est protégé :

```powershell
npx supabase secrets set EXPO_ACCESS_TOKEN="TON_TOKEN_EXPO"
```

Ne placez jamais ces valeurs dans le front Vite.

## 5. Déployer les Edge Functions

```powershell
npx supabase functions deploy create-public-ticket-checkout
npx supabase functions deploy public-sumup-webhook
npx supabase functions deploy get-public-checkout-status
npx supabase functions deploy get-public-order
npx supabase functions deploy get-public-orders
npx supabase functions deploy create-public-support-request
```

Les réglages `verify_jwt = false` de `supabase/config.toml` sont intentionnels :

- les visiteurs invités doivent pouvoir démarrer un paiement ;
- le webhook SumUp ne possède pas une session Supabase ;
- les fonctions de lecture vérifient elles-mêmes le propriétaire connecté ou le jeton invité hashé ;
- le webhook relit systématiquement le checkout chez SumUp.

## 6. Configurer Supabase Auth

Dans Authentication > URL Configuration :

```text
Site URL : https://b4fevents.com
Redirect URL : https://b4fevents.com/auth/callback
Redirect URL locale : http://localhost:5173/auth/callback
```

Activez au besoin :

- Email ;
- Google ;
- Apple.

## 7. Configurer le front

Production :

```env
VITE_SUPABASE_URL=https://TON-PROJET.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_DEMO_MODE=false
VITE_PUBLIC_SITE_URL=https://b4fevents.com
```

Puis :

```powershell
npm install
npm run build
```

## 8. Tester les trois attributions

### Direct B4F

```text
https://b4fevents.com/event/66
```

À vérifier en base :

- `promoter_id` nul ;
- `manager_id` nul ;
- toutes les commissions à `0`.

### Lien général promoteur

```text
https://b4fevents.com/prenom-nom
```

### Lien événement promoteur

```text
https://b4fevents.com/prenom-nom/event/66
```

### Lien pack promoteur

```text
https://b4fevents.com/prenom-nom/pack/UUID_PACK
```

## 9. Checklist de paiement

1. ouvrir le site en navigation privée ;
2. ajouter un billet ;
3. saisir les informations client ;
4. vérifier la redirection SumUp ;
5. payer avec un moyen de test ou le protocole autorisé par votre compte ;
6. revenir sur `/paiement/retour` ;
7. vérifier `public_orders.status = paid` ;
8. vérifier `Payment.status = completed` ;
9. vérifier `Ticket` et `qr_pass` ;
10. ouvrir `/mes-billets` ;
11. télécharger le PDF ;
12. vérifier la notification dans l’application.

## 10. Vérifier l’idempotence

Renvoyez deux fois le même événement webhook ou rechargez plusieurs fois la page retour.

Résultat attendu :

- une seule vente ;
- aucun doublon de ticket ;
- aucun doublon de paiement ;
- une seule notification marquée `sent`.

## 11. Personnaliser les réductions

Table :

```text
partner_benefits
```

Remplacez les offres d’exemple :

```text
Jet Ski -15 %
Coffee Shop -10 %
```

Ajoutez :

- le vrai partenaire ;
- l’adresse ;
- le site ;
- l’image ;
- les dates de validité ;
- les conditions signées.

## 12. Rollback

La migration n’altère pas les fonctions mobiles existantes. Pour désactiver le site sans
supprimer les ventes :

- passez les Edge Functions hors ligne ;
- remettez le front en maintenance ;
- conservez `public_orders` et les liens de tickets ;
- ne supprimez pas les `Ticket`, `Payment`, `Booking` ou `qr_pass` déjà créés.
