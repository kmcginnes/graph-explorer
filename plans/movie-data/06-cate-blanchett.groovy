// Cate Blanchett cluster
// Cross-connections: Brad Pitt (from DiCaprio cluster), Martin Scorsese (from DiCaprio cluster),
//                    Steven Spielberg (from Tom Hanks cluster), studios, genres

// === People ===
g.addV('Person').property(id, 'person-cate-blanchett').property('name', 'Cate Blanchett').property('birthYear', 1969)
g.addV('Person').property(id, 'person-peter-jackson').property('name', 'Peter Jackson').property('birthYear', 1961)
g.addV('Person').property(id, 'person-ian-mckellen').property('name', 'Ian McKellen').property('birthYear', 1939)
g.addV('Person').property(id, 'person-viggo-mortensen').property('name', 'Viggo Mortensen').property('birthYear', 1958)
g.addV('Person').property(id, 'person-orlando-bloom').property('name', 'Orlando Bloom').property('birthYear', 1977)
g.addV('Person').property(id, 'person-elijah-wood').property('name', 'Elijah Wood').property('birthYear', 1981)
g.addV('Person').property(id, 'person-sandra-bullock').property('name', 'Sandra Bullock').property('birthYear', 1964)
g.addV('Person').property(id, 'person-todd-field').property('name', 'Todd Field').property('birthYear', 1964)
g.addV('Person').property(id, 'person-david-fincher').property('name', 'David Fincher').property('birthYear', 1962)
g.addV('Person').property(id, 'person-woody-allen').property('name', 'Woody Allen').property('birthYear', 1935)
g.addV('Person').property(id, 'person-shekhar-kapur').property('name', 'Shekhar Kapur').property('birthYear', 1945)

// === Movies ===
g.addV('Movie').property(id, 'movie-lotr-fellowship').property('title', 'The Lord of the Rings: The Fellowship of the Ring').property('year', 2001).property('rating', 8.9).property('tagline', 'One ring to rule them all')
g.addV('Movie').property(id, 'movie-lotr-return-king').property('title', 'The Lord of the Rings: The Return of the King').property('year', 2003).property('rating', 9.0).property('tagline', 'The eye of the enemy is moving')
g.addV('Movie').property(id, 'movie-the-aviator').property('title', 'The Aviator').property('year', 2004).property('rating', 7.5).property('tagline', 'Some men dream the future. He built it.')
g.addV('Movie').property(id, 'movie-tar').property('title', 'Tár').property('year', 2022).property('rating', 7.4).property('tagline', 'You cannot start without me')
g.addV('Movie').property(id, 'movie-the-curious-case-of-benjamin-button').property('title', 'The Curious Case of Benjamin Button').property('year', 2008).property('rating', 7.8).property('tagline', 'Life isn\\'t measured in minutes, but in moments')
g.addV('Movie').property(id, 'movie-blue-jasmine').property('title', 'Blue Jasmine').property('year', 2013).property('rating', 7.3).property('tagline', 'A Woody Allen film')
g.addV('Movie').property(id, 'movie-elizabeth').property('title', 'Elizabeth').property('year', 1998).property('rating', 7.4).property('tagline', 'Declared illegitimate aged 3. Crowned Queen aged 25.')
g.addV('Movie').property(id, 'movie-oceans-8').property('title', "Ocean's 8").property('year', 2018).property('rating', 6.2).property('tagline', 'Every con has its pros')
g.addV('Movie').property(id, 'movie-indiana-jones-crystal-skull').property('title', 'Indiana Jones and the Kingdom of the Crystal Skull').property('year', 2008).property('rating', 6.1).property('tagline', 'The adventure continues')

// === ACTED_IN ===
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-lotr-fellowship')).property('role', 'Galadriel')
g.V('person-ian-mckellen').addE('ACTED_IN').to(g.V('movie-lotr-fellowship')).property('role', 'Gandalf')
g.V('person-viggo-mortensen').addE('ACTED_IN').to(g.V('movie-lotr-fellowship')).property('role', 'Aragorn')
g.V('person-orlando-bloom').addE('ACTED_IN').to(g.V('movie-lotr-fellowship')).property('role', 'Legolas')
g.V('person-elijah-wood').addE('ACTED_IN').to(g.V('movie-lotr-fellowship')).property('role', 'Frodo Baggins')
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-lotr-return-king')).property('role', 'Galadriel')
g.V('person-ian-mckellen').addE('ACTED_IN').to(g.V('movie-lotr-return-king')).property('role', 'Gandalf')
g.V('person-viggo-mortensen').addE('ACTED_IN').to(g.V('movie-lotr-return-king')).property('role', 'Aragorn')
g.V('person-orlando-bloom').addE('ACTED_IN').to(g.V('movie-lotr-return-king')).property('role', 'Legolas')
g.V('person-elijah-wood').addE('ACTED_IN').to(g.V('movie-lotr-return-king')).property('role', 'Frodo Baggins')
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-the-aviator')).property('role', 'Katharine Hepburn')
// Cross-connection: Leonardo DiCaprio from cluster 04
g.V('person-leonardo-dicaprio').addE('ACTED_IN').to(g.V('movie-the-aviator')).property('role', 'Howard Hughes')
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-tar')).property('role', 'Lydia Tár')
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-the-curious-case-of-benjamin-button')).property('role', 'Daisy Fuller')
// Cross-connection: Brad Pitt from DiCaprio cluster
g.V('person-brad-pitt').addE('ACTED_IN').to(g.V('movie-the-curious-case-of-benjamin-button')).property('role', 'Benjamin Button')
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-blue-jasmine')).property('role', 'Jasmine')
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-elizabeth')).property('role', 'Elizabeth I')
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-oceans-8')).property('role', 'Lou')
g.V('person-sandra-bullock').addE('ACTED_IN').to(g.V('movie-oceans-8')).property('role', 'Debbie Ocean')
// Cross-connection: Anne Hathaway from Meryl Streep cluster
g.V('person-anne-hathaway').addE('ACTED_IN').to(g.V('movie-oceans-8')).property('role', 'Daphne Kluger')
g.V('person-cate-blanchett').addE('ACTED_IN').to(g.V('movie-indiana-jones-crystal-skull')).property('role', 'Irina Spalko')

// === DIRECTED ===
g.V('person-peter-jackson').addE('DIRECTED').to(g.V('movie-lotr-fellowship'))
g.V('person-peter-jackson').addE('DIRECTED').to(g.V('movie-lotr-return-king'))
// Cross-connection: Martin Scorsese from DiCaprio cluster
g.V('person-martin-scorsese').addE('DIRECTED').to(g.V('movie-the-aviator'))
g.V('person-todd-field').addE('DIRECTED').to(g.V('movie-tar'))
g.V('person-david-fincher').addE('DIRECTED').to(g.V('movie-the-curious-case-of-benjamin-button'))
g.V('person-woody-allen').addE('DIRECTED').to(g.V('movie-blue-jasmine'))
g.V('person-shekhar-kapur').addE('DIRECTED').to(g.V('movie-elizabeth'))
// Cross-connection: Steven Spielberg from Tom Hanks cluster
g.V('person-steven-spielberg').addE('DIRECTED').to(g.V('movie-indiana-jones-crystal-skull'))

// === HAS_GENRE ===
g.V('movie-lotr-fellowship').addE('HAS_GENRE').to(g.V('genre-fantasy'))
g.V('movie-lotr-fellowship').addE('HAS_GENRE').to(g.V('genre-adventure'))
g.V('movie-lotr-return-king').addE('HAS_GENRE').to(g.V('genre-fantasy'))
g.V('movie-lotr-return-king').addE('HAS_GENRE').to(g.V('genre-adventure'))
g.V('movie-the-aviator').addE('HAS_GENRE').to(g.V('genre-biography'))
g.V('movie-the-aviator').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-tar').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-tar').addE('HAS_GENRE').to(g.V('genre-musical'))
g.V('movie-the-curious-case-of-benjamin-button').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-the-curious-case-of-benjamin-button').addE('HAS_GENRE').to(g.V('genre-fantasy'))
g.V('movie-the-curious-case-of-benjamin-button').addE('HAS_GENRE').to(g.V('genre-romance'))
g.V('movie-blue-jasmine').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-blue-jasmine').addE('HAS_GENRE').to(g.V('genre-comedy'))
g.V('movie-elizabeth').addE('HAS_GENRE').to(g.V('genre-biography'))
g.V('movie-elizabeth').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-elizabeth').addE('HAS_GENRE').to(g.V('genre-history'))
g.V('movie-oceans-8').addE('HAS_GENRE').to(g.V('genre-crime'))
g.V('movie-oceans-8').addE('HAS_GENRE').to(g.V('genre-comedy'))
g.V('movie-indiana-jones-crystal-skull').addE('HAS_GENRE').to(g.V('genre-adventure'))
g.V('movie-indiana-jones-crystal-skull').addE('HAS_GENRE').to(g.V('genre-action'))

// === PRODUCED_BY ===
g.V('movie-lotr-fellowship').addE('PRODUCED_BY').to(g.V('studio-newline'))
g.V('movie-lotr-return-king').addE('PRODUCED_BY').to(g.V('studio-newline'))
g.V('movie-the-aviator').addE('PRODUCED_BY').to(g.V('studio-miramax'))
g.V('movie-tar').addE('PRODUCED_BY').to(g.V('studio-universal'))
g.V('movie-the-curious-case-of-benjamin-button').addE('PRODUCED_BY').to(g.V('studio-paramount'))
g.V('movie-blue-jasmine').addE('PRODUCED_BY').to(g.V('studio-columbia'))
g.V('movie-elizabeth').addE('PRODUCED_BY').to(g.V('studio-universal'))
g.V('movie-oceans-8').addE('PRODUCED_BY').to(g.V('studio-warner'))
g.V('movie-indiana-jones-crystal-skull').addE('PRODUCED_BY').to(g.V('studio-paramount'))

// === WON_AWARD ===
g.V('person-cate-blanchett').addE('WON_AWARD').to(g.V('award-best-actress')).property('year', 2014)
g.V('person-cate-blanchett').addE('WON_AWARD').to(g.V('award-best-supporting-actress')).property('year', 2005)
g.V('movie-lotr-return-king').addE('WON_AWARD').to(g.V('award-best-picture')).property('year', 2004)
g.V('person-peter-jackson').addE('WON_AWARD').to(g.V('award-best-director')).property('year', 2004)
