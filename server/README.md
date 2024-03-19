# Ohjeet
## Ympäristömuuttujat
```shell
# kopioi .env.example tiedosto .env tiedostoksi
cp .env.example .env

# muokkaa .env tiedostoa
# esim. tietokannan yhteysasetukset ja tietokannan nimi
```

## Tietokannan migraatiot
Db-migrate -työkalun dokumentaatio: https://db-migrate.readthedocs.io/en/latest/
### Asennus
Db-migrate -työkalu asennetaan globaalisti, jotta sitä voidaan käyttää komentoriviltä mistä tahansa.
```shell
npm install -g db-migrate
```

### Migraation suoritus
Tietokanta päivitetään vastaamaan uusinta versiota.
```shell
db-migrate up
```

### Migraation peruutus
Tietokanta palautetaan edelliseen tilaan, joka oli ennen migraation suorittamista.
```shell
db-migrate down
```

### Uuden migraation luonti
Uusi migraatio luodaan, kun halutaan muuttaa tietokantaa. Migraation luomisen jälkeen voit muokata luotua tiedostoa,
joka löytyy kansiosta ``/migrations/sqls``.

- .up.sql sisältää migraation luontikoodin
- .down.sql sisältää migraation poistokoodin

Se, mitä tehdään .up.sql -tiedostossa poistetaan .down.sql -tiedostossa ja päinvastoin.

```shell
db-migrate create <migraation nimi>
```
