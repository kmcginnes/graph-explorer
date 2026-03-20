// Meryl Streep cluster
// Cross-connections: Steven Spielberg (from Tom Hanks cluster), studios, genres

// === People ===
g.addV('Person').property(id, 'person-meryl-streep').property('name', 'Meryl Streep').property('birthYear', 1949)
g.addV('Person').property(id, 'person-clint-eastwood').property('name', 'Clint Eastwood').property('birthYear', 1930)
g.addV('Person').property(id, 'person-jack-nicholson').property('name', 'Jack Nicholson').property('birthYear', 1937)
g.addV('Person').property(id, 'person-amy-adams').property('name', 'Amy Adams').property('birthYear', 1974)
g.addV('Person').property(id, 'person-philip-seymour-hoffman').property('name', 'Philip Seymour Hoffman').property('birthYear', 1967)
g.addV('Person').property(id, 'person-anne-hathaway').property('name', 'Anne Hathaway').property('birthYear', 1982)
g.addV('Person').property(id, 'person-david-frankel').property('name', 'David Frankel').property('birthYear', 1959)
g.addV('Person').property(id, 'person-nancy-meyers').property('name', 'Nancy Meyers').property('birthYear', 1949)
g.addV('Person').property(id, 'person-mike-nichols').property('name', 'Mike Nichols').property('birthYear', 1931)
g.addV('Person').property(id, 'person-dustin-hoffman').property('name', 'Dustin Hoffman').property('birthYear', 1937)
g.addV('Person').property(id, 'person-robert-benton').property('name', 'Robert Benton').property('birthYear', 1932)
g.addV('Person').property(id, 'person-john-patrick-shanley').property('name', 'John Patrick Shanley').property('birthYear', 1950)

// === Movies ===
g.addV('Movie').property(id, 'movie-the-devil-wears-prada').property('title', 'The Devil Wears Prada').property('year', 2006).property('rating', 6.9).property('tagline', 'Hell on heels')
g.addV('Movie').property(id, 'movie-bridges-of-madison-county').property('title', 'The Bridges of Madison County').property('year', 1995).property('rating', 7.6).property('tagline', 'This kind of certainty comes but once in a lifetime')
g.addV('Movie').property(id, 'movie-somethings-gotta-give').property('title', "Something's Gotta Give").property('year', 2003).property('rating', 6.7).property('tagline', 'Sexy. Funny. Unexpected.')
g.addV('Movie').property(id, 'movie-doubt').property('title', 'Doubt').property('year', 2008).property('rating', 7.5).property('tagline', 'There is no evidence. There are no witnesses. But for one, there is no doubt.')
g.addV('Movie').property(id, 'movie-kramer-vs-kramer').property('title', 'Kramer vs. Kramer').property('year', 1979).property('rating', 7.8).property('tagline', 'There are three sides to this love story')
g.addV('Movie').property(id, 'movie-the-post').property('title', 'The Post').property('year', 2017).property('rating', 7.2).property('tagline', 'Truth be told')
g.addV('Movie').property(id, 'movie-silkwood').property('title', 'Silkwood').property('year', 1983).property('rating', 7.1).property('tagline', 'On November 13, 1974, Karen Silkwood set out to meet a reporter')
g.addV('Movie').property(id, 'movie-sophies-choice').property('title', "Sophie's Choice").property('year', 1982).property('rating', 7.6).property('tagline', 'A story of love, madness, and the Holocaust')

// === ACTED_IN ===
g.V('person-meryl-streep').addE('ACTED_IN').to(g.V('movie-the-devil-wears-prada')).property('role', 'Miranda Priestly')
g.V('person-anne-hathaway').addE('ACTED_IN').to(g.V('movie-the-devil-wears-prada')).property('role', 'Andy Sachs')
g.V('person-meryl-streep').addE('ACTED_IN').to(g.V('movie-bridges-of-madison-county')).property('role', 'Francesca Johnson')
g.V('person-clint-eastwood').addE('ACTED_IN').to(g.V('movie-bridges-of-madison-county')).property('role', 'Robert Kincaid')
g.V('person-meryl-streep').addE('ACTED_IN').to(g.V('movie-somethings-gotta-give')).property('role', 'Zoe')
g.V('person-jack-nicholson').addE('ACTED_IN').to(g.V('movie-somethings-gotta-give')).property('role', 'Harry Sanborn')
g.V('person-meryl-streep').addE('ACTED_IN').to(g.V('movie-doubt')).property('role', 'Sister Aloysius Beauvier')
g.V('person-philip-seymour-hoffman').addE('ACTED_IN').to(g.V('movie-doubt')).property('role', 'Father Brendan Flynn')
g.V('person-amy-adams').addE('ACTED_IN').to(g.V('movie-doubt')).property('role', 'Sister James')
g.V('person-meryl-streep').addE('ACTED_IN').to(g.V('movie-kramer-vs-kramer')).property('role', 'Joanna Kramer')
g.V('person-dustin-hoffman').addE('ACTED_IN').to(g.V('movie-kramer-vs-kramer')).property('role', 'Ted Kramer')
g.V('person-meryl-streep').addE('ACTED_IN').to(g.V('movie-the-post')).property('role', 'Katharine Graham')
// Cross-connection: Tom Hanks from cluster 02
g.V('person-tom-hanks').addE('ACTED_IN').to(g.V('movie-the-post')).property('role', 'Ben Bradlee')
g.V('person-meryl-streep').addE('ACTED_IN').to(g.V('movie-silkwood')).property('role', 'Karen Silkwood')
g.V('person-meryl-streep').addE('ACTED_IN').to(g.V('movie-sophies-choice')).property('role', 'Sophie Zawistowski')

// === DIRECTED ===
g.V('person-david-frankel').addE('DIRECTED').to(g.V('movie-the-devil-wears-prada'))
g.V('person-clint-eastwood').addE('DIRECTED').to(g.V('movie-bridges-of-madison-county'))
g.V('person-nancy-meyers').addE('DIRECTED').to(g.V('movie-somethings-gotta-give'))
g.V('person-john-patrick-shanley').addE('DIRECTED').to(g.V('movie-doubt'))
g.V('person-robert-benton').addE('DIRECTED').to(g.V('movie-kramer-vs-kramer'))
// Cross-connection: Steven Spielberg from cluster 02
g.V('person-steven-spielberg').addE('DIRECTED').to(g.V('movie-the-post'))
g.V('person-mike-nichols').addE('DIRECTED').to(g.V('movie-silkwood'))

// === HAS_GENRE ===
g.V('movie-the-devil-wears-prada').addE('HAS_GENRE').to(g.V('genre-comedy'))
g.V('movie-the-devil-wears-prada').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-bridges-of-madison-county').addE('HAS_GENRE').to(g.V('genre-romance'))
g.V('movie-bridges-of-madison-county').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-somethings-gotta-give').addE('HAS_GENRE').to(g.V('genre-comedy'))
g.V('movie-somethings-gotta-give').addE('HAS_GENRE').to(g.V('genre-romance'))
g.V('movie-doubt').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-kramer-vs-kramer').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-the-post').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-the-post').addE('HAS_GENRE').to(g.V('genre-history'))
g.V('movie-silkwood').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-silkwood').addE('HAS_GENRE').to(g.V('genre-biography'))
g.V('movie-sophies-choice').addE('HAS_GENRE').to(g.V('genre-drama'))
g.V('movie-sophies-choice').addE('HAS_GENRE').to(g.V('genre-romance'))

// === PRODUCED_BY ===
g.V('movie-the-devil-wears-prada').addE('PRODUCED_BY').to(g.V('studio-fox'))
g.V('movie-bridges-of-madison-county').addE('PRODUCED_BY').to(g.V('studio-warner'))
g.V('movie-somethings-gotta-give').addE('PRODUCED_BY').to(g.V('studio-columbia'))
g.V('movie-doubt').addE('PRODUCED_BY').to(g.V('studio-miramax'))
g.V('movie-kramer-vs-kramer').addE('PRODUCED_BY').to(g.V('studio-columbia'))
g.V('movie-the-post').addE('PRODUCED_BY').to(g.V('studio-fox'))
g.V('movie-silkwood').addE('PRODUCED_BY').to(g.V('studio-fox'))
g.V('movie-sophies-choice').addE('PRODUCED_BY').to(g.V('studio-universal'))

// === WON_AWARD ===
g.V('person-meryl-streep').addE('WON_AWARD').to(g.V('award-best-actress')).property('year', 1983)
g.V('person-meryl-streep').addE('WON_AWARD').to(g.V('award-best-actress')).property('year', 2012)
g.V('person-meryl-streep').addE('WON_AWARD').to(g.V('award-best-supporting-actress')).property('year', 1980)
g.V('movie-kramer-vs-kramer').addE('WON_AWARD').to(g.V('award-best-picture')).property('year', 1980)
g.V('person-dustin-hoffman').addE('WON_AWARD').to(g.V('award-best-actor')).property('year', 1980)
