# TideTweetMetrics
Metrics dashboard that gives the UA CS department the ability to assess its Twitter presence against other peer universities

## Important Links

* Main wiki with deliverables: https://github.com/tefreeman/TideTweetMetrics/wiki
* System overview: https://github.com/tefreeman/TideTweetMetrics/wiki/Crawler-System

## Running the Crawler

1. Follow the dev setup instructions [here](https://github.com/tefreeman/TideTweetMetrics/wiki/Crawler-Dev-Setup)
2. Check to make sure the `crawler_config.json` file has the correct [ip and password](https://github.com/tefreeman/TideTweetMetrics/wiki/Passwords)
3. Run the `main.py` file in the `crawler_sys` folder.

## Examining the Database

1. Download [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. Follow the instructions [here](https://github.com/tefreeman/TideTweetMetrics/wiki/Passwords)

## Running DJango Middleware
1. Inside the main directory, run `pip install`
2. cd into the Api Folder (TideTweetMetrics/api)
3. Run `python manage.py runserver` to run the server
4. 
## Running Angular
1. cd into the frontend folder (TideTweetMetrics/angular/frontend)
2. Run `npm install` to install Angular and other packages
3. Start Django Middleware (See above)
4. Run `ng serve --open` to run the application

