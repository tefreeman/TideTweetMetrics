from backend.config import Config
import logging

Config.init()
key = Config.email_key()

def send_report(addresses: list[str]) -> None:
    # These imports must be done INSIDE of this function (to prevent circular import)
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail

    message = Mail(
        from_email='tidetweetmetrics@gmail.com',
        to_emails=addresses,
        subject='Tide Tweet Metrics Dashboard Update',
        html_content='Your Tide Tweet Metrics dashboard has been updated!')
    try:
        # sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        sg = SendGridAPIClient(key)
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        logging.error(e.message)
