import {
  media,
} from "./media";

import type {
  PublicEvent,
  PublicPack,
} from "../types";

/* =========================================================
   FUTURE DATE
========================================================= */

function futureDate(
  days: number,
) {
  const date =
    new Date();

  date.setDate(
    date.getDate() +
      days,
  );

  return date
    .toISOString()
    .slice(
      0,
      10,
    );
}

/* =========================================================
   DEMO EVENTS
========================================================= */

const events:
  PublicEvent[] =
  [
    /* =====================================================
       EVENT 1
    ===================================================== */

    {
      id:
        1001,

      name:
        "B4F Sunset Pool",

      location:
        "Barcelona",

      address:
        "Passeig Marítim, Barcelona",

      type:
        "pool_party",

      description:
        "Une pool party B4F au coucher du soleil avec DJ set, cocktails et accès réservé.",

      /*
       * OBLIGATOIRE DANS PublicEvent
       */
      miniDescription:
        "Pool party, sunset, DJ set et cocktails à Barcelone.",

      eventDate:
        futureDate(
          2,
        ),

      startTime:
        "17:00:00",

      endTime:
        "23:30:00",

      imageUrl:
        media.pool,

      mediaLink:
        null,

      womenPrice:
        18,

      menPrice:
        22,

      womenCapacity:
        200,

      menCapacity:
        200,

      womenSold:
        84,

      menSold:
        91,

      soldout:
        false,

      options:
        [
          {
            id:
              5001,

            eventId:
              1001,

            name:
              "Accès coupe-file",

            description:
              "Entrée prioritaire.",

            price:
              6,
          },
        ],

      tables:
        [
          {
            id:
              8001,

            eventId:
              1001,

            name:
              "Table Sunset",

            description:
              "Table réservée pour le groupe.",

            fullPrice:
              240,

            depositPercentage:
              30,

            depositPrice:
              72,
          },
        ],
    },

    /* =====================================================
       EVENT 2
    ===================================================== */

    {
      id:
        1002,

      name:
        "Boat Party Barcelona",

      location:
        "Port Olímpic",

      address:
        "Moll de la Marina, Barcelona",

      type:
        "boat_party",

      description:
        "Embarquez avec B4F pour une soirée en mer avec musique, sunset et boissons.",

      miniDescription:
        "Boat party B4F en mer avec musique, sunset et boissons.",

      eventDate:
        futureDate(
          5,
        ),

      startTime:
        "18:30:00",

      endTime:
        "22:30:00",

      imageUrl:
        media.boat,

      mediaLink:
        null,

      womenPrice:
        35,

      menPrice:
        39,

      womenCapacity:
        120,

      menCapacity:
        120,

      womenSold:
        120,

      menSold:
        120,

      soldout:
        true,

      options:
        [],

      tables:
        [],
    },

    /* =====================================================
       EVENT 3
    ===================================================== */

    {
      id:
        1003,

      name:
        "B4F Night Experience",

      location:
        "The Club Barcelona",

      address:
        "Barcelona",

      type:
        "nightclubs",

      description:
        "La grande nuit B4F avec une sélection internationale, accès VIP et ambiance jusqu’au matin.",

      miniDescription:
        "Une nuit B4F en club avec accès VIP et ambiance jusqu’au matin.",

      eventDate:
        futureDate(
          8,
        ),

      startTime:
        "23:30:00",

      endTime:
        "06:00:00",

      imageUrl:
        media.club,

      mediaLink:
        null,

      womenPrice:
        20,

      menPrice:
        25,

      womenCapacity:
        300,

      menCapacity:
        300,

      womenSold:
        145,

      menSold:
        161,

      soldout:
        false,

      options:
        [
          {
            id:
              5002,

            eventId:
              1003,

            name:
              "Fast pass",

            description:
              "File d’entrée dédiée.",

            price:
              7,
          },
        ],

      tables:
        [],
    },

    /* =====================================================
       EVENT 4
    ===================================================== */

    {
      id:
        1004,

      name:
        "French Open Bar",

      location:
        "Barcelona",

      address:
        "Carrer de la Marina, Barcelona",

      type:
        "open_bar",

      description:
        "Une soirée francophone avec open bar limité, DJ set et accès B4F.",

      miniDescription:
        "Soirée francophone B4F avec DJ set et open bar.",

      eventDate:
        futureDate(
          13,
        ),

      startTime:
        "22:00:00",

      endTime:
        "03:00:00",

      imageUrl:
        media.openBar,

      mediaLink:
        null,

      womenPrice:
        25,

      menPrice:
        29,

      womenCapacity:
        180,

      menCapacity:
        180,

      womenSold:
        73,

      menSold:
        79,

      soldout:
        false,

      options:
        [],

      tables:
        [],
    },
  ];

/* =========================================================
   EXPORT EVENTS
========================================================= */

export const demoEvents =
  events;

/* =========================================================
   DEMO PACKS
========================================================= */

export const demoPacks:
  PublicPack[] =
  [
    /* =====================================================
       PACK 1
    ===================================================== */

    {
      id:
        "demo-pack-1",

      name:
        "B4F Weekend Pass",

      description:
        "Un pack pour vivre trois expériences B4F avec une soirée obligatoire et un choix parmi deux événements.",

      womenPrice:
        55,

      menPrice:
        65,

      womenCapacity:
        120,

      menCapacity:
        120,

      womenSold:
        52,

      menSold:
        61,

      imageUrl:
        media.crowd,

      colorName:
        "Orange",

      colorHex:
        "#fb923c",

      soldout:
        false,

      earliestEventDate:
        events[0]
          .eventDate,

      events:
        [
          /* ===============================================
             REQUIRED
          =============================================== */

          {
            id:
              "demo-pe-1",

            packId:
              "demo-pack-1",

            eventId:
              events[0]
                .id,

            eventType:
              "required",

            choiceGroupKey:
              null,

            choiceGroupTitle:
              null,

            minChoices:
              1,

            maxChoices:
              1,

            event:
              events[0],

            options:
              events[0]
                .options,

            tables:
              [],
          },

          /* ===============================================
             CHOICE 1
          =============================================== */

          {
            id:
              "demo-pe-2",

            packId:
              "demo-pack-1",

            eventId:
              events[2]
                .id,

            eventType:
              "choice",

            choiceGroupKey:
              "night",

            choiceGroupTitle:
              "Choisissez votre soirée",

            minChoices:
              1,

            maxChoices:
              1,

            event:
              events[2],

            options:
              events[2]
                .options,

            tables:
              [],
          },

          /* ===============================================
             CHOICE 2
          =============================================== */

          {
            id:
              "demo-pe-3",

            packId:
              "demo-pack-1",

            eventId:
              events[3]
                .id,

            eventType:
              "choice",

            choiceGroupKey:
              "night",

            choiceGroupTitle:
              "Choisissez votre soirée",

            minChoices:
              1,

            maxChoices:
              1,

            event:
              events[3],

            options:
              [],

            tables:
              [],
          },
        ],
    },

    /* =====================================================
       PACK 2
    ===================================================== */

    {
      id:
        "demo-pack-2",

      name:
        "B4F Ultimate Pack",

      description:
        "Le pack complet B4F pour plusieurs événements de la semaine.",

      womenPrice:
        99,

      menPrice:
        115,

      womenCapacity:
        80,

      menCapacity:
        80,

      womenSold:
        80,

      menSold:
        80,

      imageUrl:
        media.sunset,

      colorName:
        "Pink",

      colorHex:
        "#ff69b4",

      soldout:
        true,

      earliestEventDate:
        events[0]
          .eventDate,

      events:
        [
          /* ===============================================
             REQUIRED 1
          =============================================== */

          {
            id:
              "demo-pe-4",

            packId:
              "demo-pack-2",

            eventId:
              events[0]
                .id,

            eventType:
              "required",

            choiceGroupKey:
              null,

            choiceGroupTitle:
              null,

            minChoices:
              1,

            maxChoices:
              1,

            event:
              events[0],

            options:
              [],

            tables:
              [],
          },

          /* ===============================================
             REQUIRED 2
          =============================================== */

          {
            id:
              "demo-pe-5",

            packId:
              "demo-pack-2",

            eventId:
              events[2]
                .id,

            eventType:
              "required",

            choiceGroupKey:
              null,

            choiceGroupTitle:
              null,

            minChoices:
              1,

            maxChoices:
              1,

            event:
              events[2],

            options:
              [],

            tables:
              [],
          },
        ],
    },
  ];