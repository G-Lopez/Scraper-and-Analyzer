
Contributors:

- Gabriel Lopez
- Jacob Shomstein  

### API DOCS
```
GET/{collection}?{filters}
```
| collections        |
|--------------------|
| hotels             |
| reviews            |
| snapshots          |

| Filters | value | description |
|------------------------|------------------|----------------------------------------------------------------------------------|
| id | Number | filters by id |
| name | String (Elastic) | filters by parts or whole name |
| keyword | String | filters by one keyword derived from reviews |
| tag | String | filters by one tag from the hotel |
| forbes_equals | Number (1-5) | filters by hotels with forbes rating equal to the value |
| forbes_min | Number (1-5) | filters by hotels with forbes rating greater than the value |
| forbes_max | Number (1-5) | filters by hotels with forbes rating less than the value |
| room_num_min | Number | filters by hotels with more rooms than the value |
| room_num_max | Number | filters by hotels with less rooms than the value |
| certificate | Boolean | filters by hotels with or without the "Certificate of Excellence" |
| total_revs_min | Number | filters by snapshots by a minimum amount of total reviews |
| total_revs_max | Number | filters by snapshots by a maximum amount of total reviews |
| rank_min | Number | filters by snapshots with a minimum rank of the value |
| rank_max | Number | filters by snapshots with a maximum rank of the value |
| general_rating_min | Number | filters by snapshots with a minimum general rating of the value |
| general_rating_max | Number | filters by snapshots with a maximum general rating of the value |
| excellent_rating_min | Number | filters by snapshots with a minimum number of excellent reviews of the value |
| excellent_rating_max | Number | filters by snapshots with a maximum number of excellent reviews of the value |
| very_good_rating_min | Number | filters by snapshots with a minimum number of very good reviews of the value |
| very_good_rating_max | Number | filters by snapshots with a maximum number of very good reviews of the value |
| average_rating_min | Number | filters by snapshots with a minimum number of average reviews of the value |
| average_rating_max | Number | filters by snapshots with a maximum number of average reviews of the value |
| poor_rating_min | Number | filters by snapshots with a minimum number of poor reviews of the value |
| poor_rating_max | Number | filters by snapshots with a maximum number of poor reviews of the value |
| terrible_rating_min | Number | filters by snapshots with a minimum number of terrible reviews of the value |
| terrible_rating_max | Number | filters by snapshots with a maximum number of terrible reviews of the value |
| review_word | String | filters reviews by searching for that word |
| review_rating_min | Number | filters reviews by the minimum review rating  |
| review_rating_max | Number | filters reviews by the maximum review rating |
| mobile | Boolean | filters reviews by if it was written on a mobile device |
| user_name | String | filters reviews by the user's name |
| user_id | Number | filters the reviews by the user's id |
| user_reviews_help_min | Number | filters reviews by the minimum amount of helpful reviews |
| user_reviews_hotel_min | Number | filters reviews by the minimum amount of hotel reviews |
| user_reviews_total_min | Number | filters reviews by the minimum amount of total reviews |
| days_ago | Number | filters snapshots by the data which is *value* number of days or less from today |
|  |  |  |
