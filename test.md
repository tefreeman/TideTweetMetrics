# 1. Automated Testing for Important Specified Features

For convenience, we have setup a file in the *filepath* directory which runs all the automated unit tests in an appropriate order.
In the *test/backend/metric_system* folder, should run test_metric_system.py before running the tests in the *generator* subdirectory. The former generates the *ex_testing_metric_out.json* file, against which the contents of the latter are tested.

# 2. High-Risk Features:

The directory structure of the tests folder matches that of the repository as a whole. For instance, the root directory has a *backend/crawler_sys/database.py* filepath. This is matched by *test/backend/crawler_sys/test_database.py*.

The most high-risk features are arguably those upon which the others are built--those that must be functioning properly in order to have any meaningful functionality at all. For this project, tests over such feature could include:

## test_database.py
This tests the various functions by which CRUD operations are performed on Tweets and Profiles in the database. A bug in this file could lead to incorrect data being stored.

## test_meta_encoder.py, test_metric_encoder.py, test_profile_encoder.py, test_tweet_encoder.py
The files test the functionality of the encoders, which ensure that information is stored in the right structure/format when being passed too and from the database. If these are not properly set up, information could be lost or fail to transfer. 

# 3. User Acceptance Testing

See UserAcceptanceTesting.pdf for details on this aspect of the testing process.