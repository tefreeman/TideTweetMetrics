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
        subject='Testing testing 123',
        html_content='<strong>RAHHHHHH</strong>')
    try:
        # sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        sg = SendGridAPIClient(key)
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        logging.error(e.message)

if __name__ == "__main__":
    send_report(["samuelmgaines@gmail.com"])