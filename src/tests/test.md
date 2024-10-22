# 1. Automated Testing for Important Specified Features

<!-- Future: For convenience, we have setup a file in the `filepath` directory which runs all the automated unit tests in an appropriate order. -->
Tests are located in the `tests` directory, which is located within the root directory of the project. Within this directory, subdirectories are arranged to match the organizational structure found in the parent directory. For example, a test over `./backend/crawler_sys/database.py` is found in `./tests/backend/crawler_sys/test_database.py`.

NOTE: The Database and Metric System tests interact directly with the database. As such, you must ensure that your `main_config.json` file is configured accordingly. If you are currently using Docker, and want to reach out to the database within it, change the HOST to value to "ttm-mongo" (as seen below).
![alt text](<Images/Screenshot 2024-04-23 at 5.18.22 PM.png>)
Alternatively, if you are reaching out to an external database, find the IP address (ex. see MongoDB Compass screenshot below) and set HOST accordingly.
![alt text](<Images/Screenshot 2024-04-23 at 5.18.36 PM.png>)
![alt text](<Images/Screenshot 2024-04-23 at 5.19.05 PM.png>)
The `test_database.py` test and the encoder tests can be run at any time. However, when running tests over the generator (and over `test_metric_word_frequency.py`), the tester should *first* run `test_metric_system.py`. This script mocks a small amount of data and automatically generates the `ex_testing_metric_out.json` file, which contains every metric generated from this data. The generators, along with `test_metric_word_frequency.py`, are tested against this data.

NOTE: `test_metric_system_helper.py` should not be run. It is a helper class for `test_metric_system.py`.

# 2. High-Risk Features:

The most high-risk features are arguably those upon which the others are built--those that must be functioning properly in order to have any meaningful functionality at all. For this project, such features include:
- CRUD functionality for the Database
  - Test:
    - `test_database.py`
  - If data is not properly stored, retrieved, updated, and deleted from the database, all other functionality is for naught.
  - We ensure that information is neither lost nor mutated during transmission or manipulation of data.
- Encoding of data
  - Tests:
    - `test_meta_encoder.py`
    - `test_metric_encoder.py`
    - `test_profile_encoder.py`
    - `test_tweet_encoder.py`
  - These encoders ensure we put data into a standardized format before making use of it in various ways. Without this standardization, issues with the data in the database will inevitably follow.
  - We ensure that the setting and getting of various fields do not result in mutations.
- Generation of metrics and statistics
  - Tests:
    - `test_gen_likes_per_follower.py`
    - `test_gen_pearson_correlation_stat_generator`
    - `test_gen_standard_profile_stat_over_time_weekly.py`
    - `test_gen_standard_profile_stat_over_time.py`
    - `test_metric_word_frequency.py`
  - These generators take the raw Tweet and Profile data from our database and generate almost 200 different metrics (ex. tweet_likes-mean). A failure in one of these would lead to many incorrectly computed metrics across a lot of data.
  - We start with a small amount of data: two Profiles, each with three Tweets. These are created via the `test_metric_system.py` and the `test_metric_system_helper.py`. We then ensure that the output generated in `ex_testing_metric_out.json` matches our calculated expected values.


# 3. User Acceptance Testing
The following user acceptance tests verify the main system functions.

## Account Creation
- Visit the Welcome page.

- Click the *Create Account / Log in* button.
- Create an account.
  - NOTE: Admin approval is required for the account recieve access permissions.
  ![alt text](Images/image.png)
- Verify: 
  - A message is displayed indicating that the admin must approve.

## Login
- Visit the Welcome page.
- Enter invalid username and/or password.
- Verify that you are unable to log in.
- Enter correct credentials.
- Verify:
  - Login attempt was successful.
  ![alt text](<Images/Screenshot 2024-04-23 at 4.47.33 PM.png>)

## Data Card (and Card Grid) Creation
- Visit Dashboard page.
- Click *Add my first grid!*. Add a Card Grid.
- Click *Card Edit*.
- Scroll through the provided list, or searching by metric and/or owner. Click *Add*.
![alt text](<Images/Screenshot 2024-04-23 at 4.50.31 PM.png>)
- Verify:
  - The card appears on the Dashboard.
- Repeat process as desired.
![alt text](<Images/Screenshot 2024-04-23 at 4.51.08 PM.png>)

## Data Card (and Card Grid) Deletion
- After previous steps...
- Click *Card Edit*.
- Delete Cards as desired by clicking the red 'X' button in the top right corner of a Card.
![alt text](<Images/Screenshot 2024-04-23 at 4.55.13 PM.png>)
- Verify:
  - The card is deleted from the Dashboard.
- Click *Confirm* to exit Card Editing mode.
- Click *Grid Edit*.
- Click the trash icon.
![alt text](<Images/Screenshot 2024-04-23 at 4.52.30 PM.png>)
- Verify:
  - The grid is deleted.
- Click *Confirm*.

## Graph Card (and Graph Grid) Creation
- Visit the Dashboard page.
- Click *Grid Edit* and *Add Grid*.
- Create a Graph Grid.
- Click *Card Edit* and click the '+' button.
![alt text](<Images/Screenshot 2024-04-23 at 4.59.57 PM.png>)
- Select the metric you would like to examine. Add and delete owners as desired. 
![alt text](<Images/Screenshot 2024-04-23 at 5.02.04 PM.png>)
Click *Add*.
- Verify:
  - The graph appears on the Dashboard.


## Graph Card (and Graph Grid) Deletion
- After previous steps...
- Click *Card Edit*.
- Delete graphs or cards as desired by clicking the red 'X' button in the top right corner of them.
![Card Deletion](Images/carddeletion.png)
- Verify:
  - The Graph is deleted from the Dashboard.
- Click *Confirm* to exit Card Editing mode.
- Click *Grid Edit*.
- Click the trash icon.
- Verify:
  - The grid is deleted.
- Click *Confirm*.

## Update Metrics
- Visit Dashboard page (as admin).
- On the sidebar, click My Profile.
- Scroll down and click Update under Metric Update.
- Verify:
   The metrics are updated and loaded to frontend (after some time)

## Remove an Approved Account
- Visit Dashboard page (as admin)
- On the sidebar, click My Profile.
- Scroll down and remove an approved account.
![List of admin approved accounts](Images/removeaccount.png)
- Verify:
  - The account is deleted (by attempting to login)

## Email Reports
- Visit Dashboard page.
- On the sidebar, click My Profile.
- Check the box beside Opt In for E-Mail Reports
![Email report checkbox](Images/emailreportcheck.png)
- Trigger an email by updating the dashboard
- Verify:
  - The email address on file receives an email from tidetweetmetrics@gmail.com

## Add a Custom Dashboard
- Visit Dashboard page.
- On the sidebar, click Add under Custom Dashboards.
- Create a custom dashboard with some specified name.
![Dashboard creation](Images/newdashboard.png)
- Verify:
  - A blank custom dashboard is created with the specified name.
  - Cards and graphs can be added to this new custom dashboard.

## Optimizer Testing
- Visit Dashboard page.
- On the sidebar, click Optimizer
- Type a tweet in the box that says Enter Tweet Here
![Tweet optimizer](Images/optimizer.png)
- Verify:
  - An analysis of your entered tweet is generated