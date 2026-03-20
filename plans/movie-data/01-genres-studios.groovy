// Shared genres and studios — run this first
// These are referenced by all other cluster files

// Genres
g.addV('Genre').property(id, 'genre-drama').property('name', 'Drama')
g.addV('Genre').property(id, 'genre-comedy').property('name', 'Comedy')
g.addV('Genre').property(id, 'genre-thriller').property('name', 'Thriller')
g.addV('Genre').property(id, 'genre-scifi').property('name', 'Science Fiction')
g.addV('Genre').property(id, 'genre-romance').property('name', 'Romance')
g.addV('Genre').property(id, 'genre-action').property('name', 'Action')
g.addV('Genre').property(id, 'genre-crime').property('name', 'Crime')
g.addV('Genre').property(id, 'genre-war').property('name', 'War')
g.addV('Genre').property(id, 'genre-biography').property('name', 'Biography')
g.addV('Genre').property(id, 'genre-history').property('name', 'History')
g.addV('Genre').property(id, 'genre-adventure').property('name', 'Adventure')
g.addV('Genre').property(id, 'genre-fantasy').property('name', 'Fantasy')
g.addV('Genre').property(id, 'genre-animation').property('name', 'Animation')
g.addV('Genre').property(id, 'genre-musical').property('name', 'Musical')
g.addV('Genre').property(id, 'genre-horror').property('name', 'Horror')

// Studios
g.addV('Studio').property(id, 'studio-paramount').property('name', 'Paramount Pictures')
g.addV('Studio').property(id, 'studio-warner').property('name', 'Warner Bros.')
g.addV('Studio').property(id, 'studio-universal').property('name', 'Universal Pictures')
g.addV('Studio').property(id, 'studio-disney').property('name', 'Walt Disney Pictures')
g.addV('Studio').property(id, 'studio-columbia').property('name', 'Columbia Pictures')
g.addV('Studio').property(id, 'studio-fox').property('name', '20th Century Fox')
g.addV('Studio').property(id, 'studio-dreamworks').property('name', 'DreamWorks')
g.addV('Studio').property(id, 'studio-mgm').property('name', 'MGM')
g.addV('Studio').property(id, 'studio-lionsgate').property('name', 'Lionsgate')
g.addV('Studio').property(id, 'studio-miramax').property('name', 'Miramax')
g.addV('Studio').property(id, 'studio-newline').property('name', 'New Line Cinema')

// Awards
g.addV('Award').property(id, 'award-best-picture').property('name', 'Academy Award for Best Picture')
g.addV('Award').property(id, 'award-best-actor').property('name', 'Academy Award for Best Actor')
g.addV('Award').property(id, 'award-best-actress').property('name', 'Academy Award for Best Actress')
g.addV('Award').property(id, 'award-best-director').property('name', 'Academy Award for Best Director')
g.addV('Award').property(id, 'award-best-supporting-actor').property('name', 'Academy Award for Best Supporting Actor')
g.addV('Award').property(id, 'award-best-supporting-actress').property('name', 'Academy Award for Best Supporting Actress')
