// Leonardo DiCaprio cluster
// Cross-connections: Jack Nicholson (from Meryl Streep cluster), Matt Damon (from Tom Hanks cluster), studios, genres

// === People ===
g.addV('Person').property(id, 'person-leonardo-dicaprio').property('name', 'Leonardo DiCaprio').property('birthYear', 1974)
g.addV('Person').property(id, 'person-martin-scorsese').property('name', 'Martin Scorsese').property('birthYear', 1942)
g.addV('Person').property(id, 'person-kate-winslet').property('name', 'Kate Winslet').property('birthYear', 1975)
g.addV('Person').property(id, 'person-james-cameron').property('name', 'James Cameron').property('birthYear', 1954)
g.addV('Person').property(id, 'person-christopher-nolan').property('name', 'Christopher Nolan').property('birthYear', 1970)
g.addV('Person').property(id, 'person-margot-robbie').property('name', 'Margot Robbie').property('birthYear', 1990)
g.addV('Person').property(id, 'person-jonah-hill').property('name', 'Jonah Hill').property('birthYear', 1983)
g.addV('Person').property(id, 'person-cillian-murphy').property('name', 'Cillian Murphy').property('birthYear', 1976)
g.addV('Person').property(id, 'person-tom-hardy').property('name', 'Tom Hardy').property('birthYear', 1977)
g.addV('Person').property(id, 'person-alejandro-inarritu').property('name', 'Alejandro González Iñárritu').property('birthYear', 1963)
g.addV('Person').property(id, 'person-quentin-tarantino').property('name', 'Quentin Tarantino').property('birthYear', 1963)
g.addV('Person').property(id, 'person-brad-pitt').property('name', 'Brad Pitt').property('birthYear', 1963)

// === Movies ===
g.addV('Movie').property(id, 'movie-titanic').property('title', 'Titanic').property('year', 1997).property('rating', 7.9).property('tagline', 'Nothing on Earth could come between them')
g.addV('Movie').property(id, 'movie-the-departed').property('title', 'The Departed').property('year', 2006).property('rating', 8.5).property('tagline', 'Cops or criminals. When you are facing a loaded gun, what is the difference?')
g.addV('Movie').property(id, 'movie-inception').property('title', 'Inception').property('year', 2010).property('rating', 8.8).property('tagline', 'Your mind is the scene of the crime')
g.addV('Movie').property(id, 'movie-the-wolf-of-wall-street').property('title', 'The Wolf of Wall Street').property('year', 2013).property('rating', 8.2).property('tagline', 'EARN. SPEND. PARTY.')
g.addV('Movie').property(id, 'movie-the-revenant').property('title', 'The Revenant').property('year', 2015).property('rating', 8.0).property('tagline', 'Blood lost. Life found.')
g.addV('Movie').property(id, 'movie-shutter-island').property('title', 'Shutter Island').property('year', 2010).property('rating', 8.2).property('tagline', 'Some places never let you go')
g.addV('Movie').property(id, 'movie-once-upon-a-time-in-hollywood').property('title', 'Once Upon a Time in Hollywood').property('year', 2019).property('rating', 7.6).property('tagline', 'In this town, it can all change... like that')
g.addV('Movie').property(id, 'movie-catch-me-if-you-can').property('title', 'Catch Me If You Can').property('year', 2002).property('rating', 8.1).property('tagline', 'The true story of a real fake')

// === ACTED_IN ===
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-titanic')).property('role', 'Jack Dawson')
g.V('person-kate-winslet').addE('ACTED_IN').to(g.V('movie-titanic')).property('role', 'Rose DeWitt Bukater')
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-the-departed')).property('role', 'Billy Costigan')
// Cross-connection: Jack Nicholson from Meryl Streep cluster
g.V('person-jack-nicholson').addE('ACTED_IN').to(g.V('movie-the-departed')).property('role', 'Frank Costello')
// Cross-connection: Matt Damon from Tom Hanks cluster
g.V('person-matt-damon').addE('ACTED_IN').to(g.V('movie-the-departed')).property('role', 'Colin Sullivan')
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-inception')).property('role', 'Dom Cobb')
g.V('person-cillian-murphy').addE('ACTED_IN').to(g.V('movie-inception')).property('role', 'Robert Fischer')
g.V('person-tom-hardy').addE('ACTED_IN').to(g.V('movie-inception')).property('role', 'Eames')
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-the-wolf-of-wall-street')).property('role', 'Jordan Belfort')
g.V('person-jonah-hill').addE('ACTED_IN').to(g.V('movie-the-wolf-of-wall-street')).property('role', 'Donnie Azoff')
g.V('person-margot-robbie').addE('ACTED_IN').to(g.V('movie-the-wolf-of-wall-street')).property('role', 'Naomi Lapaglia')
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-the-revenant')).property('role', 'Hugh Glass')
g.V('person-tom-hardy').addE('ACTED_IN').to(g.V('movie-the-revenant')).property('role', 'John Fitzgerald')
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-shutter-island')).property('role', 'Teddy Daniels')
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-once-upon-a-time-in-hollywood')).property('role', 'Rick Dalton')
g.V('person-brad-pitt').addE('ACTED_IN').to(g.V('movie-once-upon-a-time-in-hollywood')).property('role', 'Cliff Booth')
g.V('person-margot-robbie').addE('ACTED_IN').to(g.V('movie-once-upon-a-time-in-hollywood')).property('role', 'Sharon Tate')
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-catch-me-if-you-can')).property('role', 'Frank Abagnale Jr.')
// Cross-connection: Tom Hanks from cluster 02
g.V('person-tom-hanks').addE('ACTED_IN').to(g.V('movie-catch-me-if-you-can')).property('role', 'Carl Hanratty')

// === DIRECTED ===
g.V('person-james-cameron').addE('DIRECTED').to(g.V('movie-titanic'))
g.V('person-martin-scorsese').addE('DIRECTED').to(g.V('movie-the-departed'))
g.V('person-christopher-nolan').addE('DIRECTED').to(g.V('movie-inception'))
g.V('person-martin-scorsese').addE('DIRECTED').to(g.V('movie-the-wolf-of-wall-street'))
g.V('person-alejandro-inarritu').addE('DIRECTED').to(g.V('movie-the-revenant'))
g.V('person-martin-scorsese').addE('DIRECTED').to(g.V('movie-shutter-island'))
g.V('person-quentin-tarantino').addE('DIRECTED').to(g.V('movie-once-upon-a-time-in-hollywood'))
// Cross-connection: Steven Spielberg from cluster 02
g.V('person-steven-spielberg').addE('DIRECTED').to(g.V('movie-catch-me-if-you-can'))

// === HAS_GENRE ===
g.V('movie-titanic').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-titanic').addE('HAS_GENRE').to(g.V('genre-romance'))
g.V('movie-the-departed').addE('HAS_GENRE').to(g.V('genre-crime'))
g.V('movie-the-departed').addE('HAS_GENRE').to(g.V('genre-thriller'))
g.V('movie-inception').addE('HAS_GENRE').to(g.V('genre-scifi'))
g.V('movie-inception').addE('HAS_GENRE').to(g.V('genre-action'))
g.V('movie-inception').addE('HAS_GENRE').to(g.V('genre-thriller'))
g.V('movie-the-wolf-of-wall-street').addE('HAS_GENRE').to(g.V('genre-comedy'))
g.V('movie-the-wolf-of-wall-street').addE('HAS_GENRE').to(g.V('genre-crime'))
g.V('movie-the-wolf-of-wall-street').addE('HAS_GENRE').to(g.V('genre-biography'))
g.V('movie-the-revenant').addE('HAS_GENRE').to(g.V('genre-adventure'))
g.V('movie-the-revenant').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-shutter-island').addE('HAS_GENRE').to(g.V('genre-thriller'))
g.V('movie-shutter-island').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-once-upon-a-time-in-hollywood').addE('HAS_GENRE').to(g.V('genre-comedy'))
g.V('movie-once-upon-a-time-in-hollywood').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-catch-me-if-you-can').addE('HAS_GENRE').to(g.V('genre-crime'))
g.V('movie-catch-me-if-you-can').addE('HAS_GENRE').to(g.V('genre-biography'))

// === PRODUCED_BY ===
g.V('movie-titanic').addE('PRODUCED_BY').to(g.V('studio-paramount'))
g.V('movie-titanic').addE('PRODUCED_BY').to(g.V('studio-fox'))
g.V('movie-the-departed').addE('PRODUCED_BY').to(g.V('studio-warner'))
g.V('movie-inception').addE('PRODUCED_BY').to(g.V('studio-warner'))
g.V('movie-the-wolf-of-wall-street').addE('PRODUCED_BY').to(g.V('studio-paramount'))
g.V('movie-the-revenant').addE('PRODUCED_BY').to(g.V('studio-fox'))
g.V('movie-shutter-island').addE('PRODUCED_BY').to(g.V('studio-paramount'))
g.V('movie-once-upon-a-time-in-hollywood').addE('PRODUCED_BY').to(g.V('studio-columbia'))
g.V('movie-catch-me-if-you-can').addE('PRODUCED_BY').to(g.V('studio-dreamworks'))

// === WON_AWARD ===
g.V('person-leonardo-dicaprio').addE('WON_AWARD').to(g.V('award-best-actor')).property('year', 2016)
g.V('movie-the-departed').addE('WON_AWARD').to(g.V('award-best-picture')).property('year', 2007)
g.V('person-martin-scorsese').addE('WON_AWARD').to(g.V('award-best-director')).property('year', 2007)
g.V('movie-titanic').addE('WON_AWARD').to(g.V('award-best-picture')).property('year', 1998)
g.V('person-james-cameron').addE('WON_AWARD').to(g.V('award-best-director')).property('year', 1998)
