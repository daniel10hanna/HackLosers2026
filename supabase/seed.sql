-- US-07 Montréal listings for November 22–28, 2026.
begin;

-- Serialize runs of this seed so concurrent runs reuse the same source.
select pg_advisory_xact_lock(hashtext('mtl-now-curated-seed'));

insert into public.sources (name, source_type, enabled)
select 'MTL NOW curated', 'website', true
where not exists (
  select 1
  from public.sources
  where name = 'MTL NOW curated'
    and source_type = 'website'
);

with curated_source as (
  select id
  from public.sources
  where name = 'MTL NOW curated'
    and source_type = 'website'
  order by id
  limit 1
), listings (
  source_event_id, dedupe_key, title, category, start_time, venue, address,
  price, latitude, longitude, source_url, audience_tags, is_indoor,
  kid_friendly, min_age
) as (
  values
    ('montreal-ca-117601', 'montreal-ca-117601-2026-11-22', 'Toddler Story Time - 19 to 36 months', 'Culture', '2026-11-22T10:15:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/toddler-story-time-19-to-36-months-117601', array['Family']::text[], null, true, null),
    ('montreal-ca-121419', 'montreal-ca-121419-2026-11-22', 'Storytime in Kabyle', 'Culture', '2026-11-22T10:30:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/storytime-kabyle-121419', array['Family']::text[], null, true, 3),
    ('montreal-ca-119673', 'montreal-ca-119673-2026-11-22', 'Storytime', 'Culture', '2026-11-22T10:30:00-05:00', 'Bibliothèque du Boisé', '2727 Boulevard Thimens, Montréal, QC H4R 1T4', 0, 45.504489, -73.704747, 'https://montreal.ca/en/events/storytime-119673', array['Family']::text[], null, true, 3),
    ('montreal-ca-119995', 'montreal-ca-119995-2026-11-22', 'Book Club', 'Culture', '2026-11-22T14:00:00-05:00', 'Bibliothèque interculturelle', '6767 Chemin de la Côte-des-Neiges, Montréal, QC H3S 2T6', 0, 45.503324, -73.636934, 'https://montreal.ca/en/events/book-club-119995', array['Solo']::text[], null, false, 18),
    ('montreal-ca-117459', 'montreal-ca-117459-2026-11-22', 'Chess Mates with Steven', 'Games', '2026-11-22T14:00:00-05:00', 'Bibliothèque Benny', '6400 Avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466297169481, -73.630973995251, 'https://montreal.ca/en/events/chess-mates-steven-117459', array['Family', 'Friends']::text[], null, true, 5),
    ('montreal-ca-113485', 'montreal-ca-113485-2026-11-23', 'ÉCO-RDV 2026: Matching the needs of contracting authorities with local solutions', 'Community', '2026-11-23T08:30:00-05:00', 'Marché Bonsecours', '350, rue Saint-Paul Est, Montréal, QC H2Y 1H2', null, 45.50899216411452, -73.55161172956304, 'https://montreal.ca/en/events/eco-rdv-2026-matching-needs-contracting-authorities-local-solutions-113485', array[]::text[], null, null, null),
    ('montreal-ca-118113', 'montreal-ca-118113-2026-11-24', 'SeniorTech', 'Technology', '2026-11-24T13:30:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/seniortech-118113', array['Solo']::text[], null, null, null),
    ('montreal-ca-115466', 'montreal-ca-115466-2026-11-24', 'Aide technologique', 'Technology', '2026-11-24T14:00:00-05:00', 'Benny Fab', '6400, avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466598, -73.630945, 'https://montreal.ca/en/events/aide-technologique-115466', array['Solo']::text[], null, null, null),
    ('montreal-ca-118268', 'montreal-ca-118268-2026-11-24', 'Conference on tax rules', 'Education', '2026-11-24T14:00:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/conference-tax-rules-118268', array['Solo']::text[], null, null, null),
    ('montreal-ca-119752s', 'montreal-ca-119752s-2026-11-24', 'Book Club', 'Culture', '2026-11-24T14:00:00-05:00', 'Bibliothèque du Boisé', '2727 Boulevard Thimens, Montréal, QC H4R 1T4', 0, 45.504489, -73.704747, 'https://montreal.ca/en/events/book-club-119752', array['Solo']::text[], null, null, null),
    ('montreal-ca-117386', 'montreal-ca-117386-2026-11-24', 'French conversation in NDG', 'Languages', '2026-11-24T16:30:00-05:00', 'Bibliothèque Benny', '6400 Avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466297169481, -73.630973995251, 'https://montreal.ca/en/events/french-conversation-ndg-117386', array['Friends']::text[], null, null, null),
    ('montreal-ca-118269', 'montreal-ca-118269-2026-11-24', 'Odors and poetic writing', 'Arts', '2026-11-24T19:00:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/odors-and-poetic-writing-118269', array['Solo']::text[], null, null, null),
    ('montreal-ca-117609', 'montreal-ca-117609-2026-11-25', 'Toddler Story Time - 0 to 18 months', 'Culture', '2026-11-25T10:15:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/toddler-story-time-0-to-18-months-117609', array['Family']::text[], null, true, 0),
    ('montreal-ca-116857', 'montreal-ca-116857-2026-11-25', 'Digital troubleshooting clinic', 'Technology', '2026-11-25T14:00:00-05:00', 'Bibliothèque Robert-Bourassa', '41 Avenue Saint-Just, Montréal, QC H2V 4T7', 0, 45.517934, -73.608452, 'https://montreal.ca/en/events/copie-de-copie-de-copie-de-copie-de-digital-troubleshooting-clinic-116857', array['Solo']::text[], null, null, null),
    ('montreal-ca-117483', 'montreal-ca-117483-2026-11-25', 'Les Rendez-vous du jeu vidéo', 'Games', '2026-11-25T16:00:00-05:00', 'Bibliothèque Benny', '6400 Avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466297169481, -73.630973995251, 'https://montreal.ca/en/events/les-rendez-vous-du-jeu-video-117483', array['Family', 'Friends']::text[], true, true, null),
    ('montreal-ca-115487', 'montreal-ca-115487-2026-11-25', 'Adult Ukulele Club', 'Music', '2026-11-25T17:00:00-05:00', 'Benny Fab', '6400, avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466598, -73.630945, 'https://montreal.ca/en/events/adult-ukulele-club-115487', array['Friends']::text[], null, null, 12),
    ('montreal-ca-119604', 'montreal-ca-119604-2026-11-25', '5 to 7 - Let''s Speak French', 'Languages', '2026-11-25T17:00:00-05:00', 'Bibliothèque interculturelle', '6767 Chemin de la Côte-des-Neiges, Montréal, QC H3S 2T6', 0, 45.503324, -73.636934, 'https://montreal.ca/en/events/5-to-7-lets-speak-french-119604', array['Friends']::text[], null, false, 18),
    ('montreal-ca-118270', 'montreal-ca-118270-2026-11-25', 'Create your own manga and superhero comic', 'Arts', '2026-11-25T19:00:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/create-your-own-manga-and-superhero-comic-118270', array['Family']::text[], null, true, 7),
    ('montreal-ca-118184', 'montreal-ca-118184-2026-11-26', 'Storytime in english with Pearl', 'Culture', '2026-11-26T10:30:00-05:00', 'Bibliothèque Benny', '6400 Avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466297169481, -73.630973995251, 'https://montreal.ca/en/events/storytime-english-pearl-118184', array['Family']::text[], null, true, 0),
    ('montreal-ca-117619', 'montreal-ca-117619-2026-11-26', 'Ping! Free Internet Training', 'Technology', '2026-11-26T13:30:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/ping-free-internet-training-117619', array['Solo']::text[], null, null, null),
    ('montreal-ca-119352', 'montreal-ca-119352-2026-11-26', 'Women''s Self-Defence Workshop (in french)', 'Wellness', '2026-11-26T14:00:00-05:00', 'Bibliothèque du Vieux-Saint-Laurent', '1380, rue de l''Église, Montréal, QC H4L 2H2', 0, 45.512818, -73.6764, 'https://montreal.ca/en/events/womens-self-defence-workshop-french-119352', array['Solo']::text[], null, false, 18),
    ('montreal-ca-115445', 'montreal-ca-115445-2026-11-26', 'Teen vidéo games', 'Games', '2026-11-26T16:00:00-05:00', 'Benny Fab', '6400, avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466598, -73.630945, 'https://montreal.ca/en/events/teen-video-games-115445', array['Family', 'Friends']::text[], true, true, 14),
    ('montreal-ca-118084', 'montreal-ca-118084-2026-11-26', 'Conference on Financial Literacy for teens', 'Education', '2026-11-26T18:00:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/conference-financial-literacy-teens-118084', array['Family']::text[], null, true, 14),
    ('montreal-ca-117566', 'montreal-ca-117566-2026-11-26', 'Silent book club', 'Culture', '2026-11-26T19:00:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/silent-book-club-117566', array['Family', 'Solo']::text[], null, true, 12),
    ('montreal-ca-117612', 'montreal-ca-117612-2026-11-26', 'Manga Book Club', 'Culture', '2026-11-26T19:00:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/manga-book-club-117612', array['Family', 'Solo']::text[], null, true, 11),
    ('montreal-ca-116546', 'montreal-ca-116546-2026-11-27', 'Afternoon Video Games', 'Games', '2026-11-27T15:00:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/afternoon-video-games-116546', array['Family']::text[], true, true, null),
    ('montreal-ca-119369', 'montreal-ca-119369-2026-11-27', 'Board Games', 'Games', '2026-11-27T16:30:00-05:00', 'Bibliothèque Benny', '6400 Avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466297169481, -73.630973995251, 'https://montreal.ca/en/events/board-games-119369', array['Family', 'Friends']::text[], null, true, null),
    ('montreal-ca-117584', 'montreal-ca-117584-2026-11-28', 'Arts and crafts at the library', 'Arts', '2026-11-28T10:30:00-05:00', 'William-G.-Boll Library', '110 Rue Cartier, Montréal, QC H8Y 1G8', 0, 45.50267, -73.814617, 'https://montreal.ca/en/events/arts-and-crafts-library-117584', array['Family', 'Friends']::text[], null, true, null),
    ('montreal-ca-118322', 'montreal-ca-118322-2026-11-28', 'Bilingual story time with Tania Baladi', 'Culture', '2026-11-28T10:30:00-05:00', 'Bibliothèque Benny', '6400 Avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466297169481, -73.630973995251, 'https://montreal.ca/en/events/bilingual-story-time-tania-baladi-118322', array['Family']::text[], null, true, null),
    ('montreal-ca-121420', 'montreal-ca-121420-2026-11-28', 'Cooking workshop : Special Christmas edition', 'Food', '2026-11-28T14:00:00-05:00', 'Pierrefonds library', '13555 Boulevard de Pierrefonds, Montréal, QC H9A 1A6', 0, 45.496195210508, -73.847222328186, 'https://montreal.ca/en/events/cooking-workshop-special-christmas-edition-121420', array['Family']::text[], null, true, 6),
    ('montreal-ca-119670', 'montreal-ca-119670-2026-11-28', 'Mixlab: Discussion Workshop: Digital Technology Explained Simply', 'Technology', '2026-11-28T14:00:00-05:00', 'Mixlab de la Bibliothèque du Boisé', '2727 Boulevard Thimens, Montréal, QC H4R 1T4', 0, 45.507869, -73.701383, 'https://montreal.ca/en/events/copie-de-copie-de-mixlab-discussion-workshop-digital-technology-explained-simply-119670', array['Solo']::text[], null, null, null),
    ('montreal-ca-119379', 'montreal-ca-119379-2026-11-28', 'Curious science experiments', 'Science', '2026-11-28T14:30:00-05:00', 'Bibliothèque Benny', '6400 Avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466297169481, -73.630973995251, 'https://montreal.ca/en/events/curious-science-experiments-119379', array['Family']::text[], null, true, null),
    ('montreal-ca-115455', 'montreal-ca-115455-2026-11-28', '3D Mania', 'Technology', '2026-11-28T15:00:00-05:00', 'Benny Fab', '6400, avenue de Monkland, Montréal, QC H4B 1H3', 0, 45.466598, -73.630945, 'https://montreal.ca/en/events/3d-mania-115455', array['Family']::text[], true, true, 7),
    ('montreal-ca-118446', 'montreal-ca-118446-2026-11-28', 'Va falloir toujours toujours', 'Theatre', '2026-11-28T16:00:00-05:00', 'Salle Émile-Legault', '613, avenue Sainte-Croix, Montréal, QC H4L 3X6', 0, 45.51183671984316, -73.67163615930953, 'https://montreal.ca/en/events/va-falloir-toujours-toujours-le-petit-theatre-de-sherbrooke-et-la-parenthese-118446', array['Family', 'Tourist']::text[], true, true, null)
)
insert into public.events (
  source_id, source_event_id, dedupe_key, title, category, start_time, venue,
  address, price, latitude, longitude, source_url, audience_tags, is_indoor,
  kid_friendly, min_age, status
)
select
  curated_source.id, listings.source_event_id, listings.dedupe_key, listings.title,
  listings.category, listings.start_time::timestamptz, listings.venue,
  listings.address, listings.price, listings.latitude, listings.longitude,
  listings.source_url, listings.audience_tags, listings.is_indoor,
  listings.kid_friendly, listings.min_age, 'published'
from listings
cross join curated_source
on conflict (dedupe_key) do update
set title = excluded.title,
    category = excluded.category,
    start_time = excluded.start_time,
    venue = excluded.venue,
    address = excluded.address,
    price = excluded.price,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    source_url = excluded.source_url,
    audience_tags = excluded.audience_tags,
    is_indoor = excluded.is_indoor,
    kid_friendly = excluded.kid_friendly,
    min_age = excluded.min_age,
    status = excluded.status;

insert into public.restaurants (
  id, title, category, address, latitude, longitude, source_url,
  audience_tags, kid_friendly, published
)
values
    ('90a2caa4-9530-5981-8277-825a82436dd8', 'Tamisé Sushi', 'Food', '4721 Rue Sainte-Catherine E, Montréal, QC H1V 1Z3', 45.5549152, -73.5316368, 'https://www.restomontreal.ca/resto/tamise-sushi-montreal/20799/en/', array['Date', 'Friends']::text[], null, true),
    ('18670c58-1b47-5580-87a2-ea9e9c1298d2', 'Lucille''s Monkland', 'Food', '5669 Avenue de Monkland, Montréal, QC H4A 1E3', 45.474891, -73.623736, 'https://www.restomontreal.ca/resto/lucilles-monkland-montreal/3197/en/', array['Date', 'Friends']::text[], null, true),
    ('156ea1f5-f0c6-5ae9-a6ce-96fe1e640c1d', 'La Piazzetta – Village', 'Food', '1101 Rue Ste-Catherine E, Montréal, QC H2L 2G6', 45.517692, -73.557106, 'https://www.restomontreal.ca/resto/la-piazzetta-montreal/1220/en/', array['Date', 'Friends']::text[], null, true),
    ('736b6709-a7dd-5eb4-ad78-c0f12c3a89e1', 'Rosélys', 'Food', '900 Boulevard René-Lévesque O, Montréal, QC H3B 4A5', 45.500492, -73.567301, 'https://www.restomontreal.ca/resto/roselys-montreal/11962/en/', array['Date', 'Family', 'Tourist']::text[], true, true),
    ('46ec4072-20d6-5f4c-9e5b-f04c0034ea33', 'Canard café', 'Food', '1951 Boulevard Rosemont, Montréal, QC H2G 1S9', 45.5420247, -73.5904147, 'https://www.restomontreal.ca/resto/canard-cafe-montreal/20950/en/', array['Solo', 'Friends']::text[], null, true),
    ('efbfee30-0582-5a72-9653-77b6a7399844', 'La Campagnola', 'Food', '1714 Avenue Dollard, Montréal, QC H8N 1T8', 45.428612, -73.631223, 'https://www.restomontreal.ca/resto/la-campagnola-montreal/819/en/', array['Date', 'Friends']::text[], null, true),
    ('b74c3342-7850-5c40-9758-26f003502af8', 'L''étoile de L''Océan', 'Food', '101 Rue Rachel E, Montréal, QC H2W 1C8', 45.519132, -73.580873, 'https://www.restomontreal.ca/resto/letoile-de-locean-montreal/1116/en/', array['Date', 'Tourist']::text[], null, true),
    ('59a09fed-c3e9-5db8-bb52-6856571880a0', 'Commodore Restaurant', 'Food', '355 Boulevard de Maisonneuve O, Montréal, QC H3A 1L6', 45.507151, -73.569114, 'https://www.restomontreal.ca/resto/commodore-restaurant-montreal/16778/en/', array['Date', 'Tourist']::text[], null, true),
    ('fac70a02-cb00-5082-9fb5-d957b0f469bd', '3 Amigos – Downtown', 'Food', '1657 Rue Ste-Catherine O, Montréal, QC H3H 1L9', 45.494424, -73.578984, 'https://www.restomontreal.ca/resto/3-amigos-montreal/1656/en/', array['Friends', 'Tourist']::text[], null, true),
    ('ffaa5975-29c6-5655-a920-fdb38692c474', 'Kwizinn', 'Food', '311 Rue Saint-Paul E, Montréal, QC H2Y 1H3', 45.50881, -73.552021, 'https://www.restomontreal.ca/resto/kwizinn-montreal/11763/en/', array['Date', 'Friends', 'Tourist']::text[], null, true),
    ('02ddbba2-b69a-5140-927d-481d491f75c5', 'Restaurant Héritaj', 'Food', '701 Rue William, Montréal, QC H3C 0T9', 45.498832, -73.558003, 'https://www.restomontreal.ca/resto/restaurant-heritaj-montreal/18989/en/', array['Date', 'Tourist']::text[], null, true),
    ('ff8f94ae-1aa1-50e4-a687-64ca4b647f0d', 'Pan Américan Pizza - Comptoir', 'Food', '853 Rue Sherbrooke O, local 25, Montréal, QC H3A 2T6', 45.5049982, -73.5780318, 'https://www.restomontreal.ca/resto/pan-american-pizza-comptoir-montreal/21600/en/', array['Solo', 'Friends']::text[], null, true)
on conflict (id) do update
set title = excluded.title,
    category = excluded.category,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    source_url = excluded.source_url,
    audience_tags = excluded.audience_tags,
    kid_friendly = excluded.kid_friendly,
    published = excluded.published;

commit;
