# US-07 Montréal listings

The seed contains 34 events from November 22–28, 2026, and 12 restaurants in
Montréal. Dates use Montréal local time. Each row has a source link and coordinates.
Refresh these dated listings before using the seed outside the hackathon week.

## Sources and fields

- [City of Montréal events calendar](https://montreal.ca/en/events). Event
  dates, venue addresses and admission prices come from the individual event
  pages. Coordinates come from their **Get an itinerary** links. A price of
  zero means free admission. Where the source gave no numeric admission price,
  the seed leaves it blank.
- Restaurant addresses, coordinates and cuisines were checked against the
  location-specific RestoMontreal pages below. Restaurant prices stay blank
  because the directory gives price bands and menus vary by dish.
- Categories and outing audiences are editorial tags based on the activity,
  venue and location. They describe likely outing contexts. Age limits and
  practical fit fields are filled only where there is source evidence.
  Where a minimum is given only in months, the integer-year field is left blank.
  No safety or wheelchair notes are inferred from a map pin. No images are used.

### Restaurant sources

- Tamisé Sushi. [Listing and coordinates](https://www.restomontreal.ca/resto/tamise-sushi-montreal/20799/en/) · [Restaurant website](https://www.tamisesushi.ca)
- Lucille's Monkland. [Listing and coordinates](https://www.restomontreal.ca/resto/lucilles-monkland-montreal/3197/en/) · [Restaurant website](https://restaurantslucilles.com/succursales/monkland/)
- La Piazzetta – Village. [Listing and coordinates](https://www.restomontreal.ca/resto/la-piazzetta-montreal/1220/en/) · [Restaurant website](https://lapiazzetta.ca)
- Rosélys. [Listing and coordinates](https://www.restomontreal.ca/resto/roselys-montreal/11962/en/) · [Restaurant website](https://www.restaurantroselys.com)
- Canard café. [Listing and coordinates](https://www.restomontreal.ca/resto/canard-cafe-montreal/20950/en/) · [Restaurant website](https://www.canardcafe.com)
- La Campagnola. [Listing and coordinates](https://www.restomontreal.ca/resto/la-campagnola-montreal/819/en/) · [Restaurant website](https://www.lacampagnola.ca)
- L'étoile de L'Océan. [Listing and coordinates](https://www.restomontreal.ca/resto/letoile-de-locean-montreal/1116/en/) · [Restaurant website](https://www.estrela.ca)
- Commodore Restaurant. [Listing and coordinates](https://www.restomontreal.ca/resto/commodore-restaurant-montreal/16778/en/) · [Restaurant website](https://www.commodoremontreal.com)
- 3 Amigos – Downtown. [Listing and coordinates](https://www.restomontreal.ca/resto/3-amigos-montreal/1656/en/) · [Restaurant website](https://3amigosrestaurants.com)
- Kwizinn. [Listing and coordinates](https://www.restomontreal.ca/resto/kwizinn-montreal/11763/en/) · [Restaurant website](https://www.kwizinn.ca)
- Restaurant Héritaj. [Listing and coordinates](https://www.restomontreal.ca/resto/restaurant-heritaj-montreal/18989/en/) · [Restaurant website](https://www.heritaj.ca)
- Pan Américan Pizza - Comptoir. [Listing and coordinates](https://www.restomontreal.ca/resto/pan-american-pizza-comptoir-montreal/21600/en/) · [Restaurant website](https://panamericanpizza.com)

## Run the seed

Apply both migrations in `supabase/migrations` in filename order on a new
database. In the intended Supabase project's SQL Editor, open a new query,
paste the complete contents of [`supabase/seed.sql`](../supabase/seed.sql),
and run it. Review the source links and dates first if the data is for a live
demo. The seed publishes the rows. It updates existing seed rows by their
stable keys, including the Book Club row from the first live test.

Open the app and switch Home from Demo to Live. Check that both an event
(`Book Club`) and a restaurant (`Rosélys`) appear. Search, Map and Chillz
can use the published records and coordinates once their screens read the
live data.
