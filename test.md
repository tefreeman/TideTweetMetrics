# 1. Automated Testing for Important Specified Features

<!-- Future: For convenience, we have setup a file in the `filepath` directory which runs all the automated unit tests in an appropriate order. -->
In the `test/backend/metric_system` folder, the tester should run `test_metric_system.py` before running the tests in the `generator` subdirectory. The former automatically generates the `ex_testing_metric_out.json` file, which holds every generated metric, against which the contents of the latter are tested.

# 2. High-Risk Features:

The directory structure of the tests folder matches that of the repository as a whole. For instance, the root directory has a `backend/crawler_sys/database.py` filepath. This is matched by `test/backend/crawler_sys/test_database.py`.

The most high-risk features are arguably those upon which the others are built--those that must be functioning properly in order to have any meaningful functionality at all. For this project, tests over such feature could include:

## test_database.py
This tests the various functions by which CRUD operations are performed on Tweets and Profiles in the database. A bug in this file could lead to incorrect data being stored.

## test_meta_encoder.py, test_metric_encoder.py, test_profile_encoder.py, test_tweet_encoder.py
These files test the functionality of the encoders, which ensure that information is stored in the right structure/format when being passed too and from the database. If these are not properly set up, information could be lost or fail to transfer. 

# 3. User Acceptance Testing
The following user acceptance tests verify the main system functions.

## Account Creation
- Visit the homepage
- Click create account/login
- Create an account
- Verify that account exists

## Login
- Visit the homepage
- Click create account/login
- Enter wrong credentials
- Verify that user is not logged in
- Enter correct credentials
- Verify that user is logged in

## Card Creation
- Visit dashboard page
- Click Card Edit
- Create a card
- Verify that card appears on dashboard
- Delete the card
- Verify that the card is deleted

## Graph Creation
- Visit dashboard page
- Click Card Edit
- Create a graph
- Verify that graph appears on dashboard
- Delete the graph
- Verify that the graph is deleted

## Update Metrics
- Visit dashboard page
- Click Update Metrics
- Verify that metrics are updated