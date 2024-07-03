from mouse import click
from mouse import move
from time import sleep 

sleep(5)
while True:
    sleep(3)
    move(-1,-1, absolute=False)    
    click()
    sleep(3)
    move(-1,-1, absolute=False)
    sleep(3)
    click()