from scheduler import CrawlerScheduler
import database as db
from config import Config
from encoders.tweet_encoder import Tweet


from utils.backup import (
    compress_backups,
    remove_backup_files,
    check_if_raw_backup_exists,
)


def crawl_job():
    print("running crawl job")
    Config.init()
    db.init_database()

    if check_if_raw_backup_exists():
        print(
            "Raw backup exists, (maybe error) compressing and removing raw backup files."
        )
        compress_backups()
        remove_backup_files()
    #accounts = db.get_crawl_list()
    famous_accounts = [
    "@BarackObama", "@realDonaldTrump", "@BillGates", "@elonmusk", "@Oprah",
    "@ladygaga", "@Cristiano", "@KingJames", "@rihanna", "@jtimberlake",
    "@taylorswift13", "@narendramodi", "@katyperry", "@TheEllenShow", "@KimKardashian",
    "@selenagomez", "@justinbieber", "@ArianaGrande", "@ddlovato", "@shakira",
    "@jimmyfallon", "@realDonaldTrump", "@BrunoMars", "@Billieeilish", "@iamsrk",
    "@LeoDiCaprio", "@kanyewest", "@JeffBezos", "@neiltyson", "@jk_rowling",
    "@Malala", "@StephenKing", "@TheRock", "@TomHanks", "@Beyonce",
    "@britneyspears", "@ChrisEvans", "@RobertDowneyJr", "@EmmaWatson", "@priyankachopra",
    "@vancityreynolds", "@Drake", "@kobebryant", "@GretaThunberg", "@JoeBiden",
    "@KamalaHarris", "@michelleobama", "@HillaryClinton", "@BernieSanders", "@AOC",
    "@djkhaled", "@KevinHart4real", "@JLo", "@Pink", "@pitbull",
    "@SnoopDogg", "@KylieJenner", "@Schwarzenegger", "@MileyCyrus", "@ParisHilton",
    "@LilTunechi", "@DrPhil", "@RyanSeacrest", "@50cent", "@Eminem",
    "@WizKhalifa", "@davidguetta", "@edsheeran", "@MariahCarey", "@SimonCowell",
    "@gordonramsay", "@SteveHarveyFM", "@tyrabanks", "@alexa_chung", "@GiGiHadid",
    "@karliekloss", "@MirandaKerr", "@AdrianaLima", "@Tyson_Fury", "@usainbolt",
    "@MichaelPhelps", "@Simone_Biles", "@serenawilliams", "@rogerfederer", "@RafaelNadal",
    "@Cristiano", "@WayneRooney", "@KAKA", "@andresiniesta8", "@XabiAlonso",
    "@Ibra_official", "@MesutOzil1088", "@3gerardpique", "@luis16suarez", "@paulpogba",
    "@MoSalah", "@VirgilvDijk", "@lewy_official", "@DeBruyneKev", "@neymarjr",
    ]
    non_famous = ["@imcsears", "@CoachLeeMartin", "@TheHoopHerald", "@sabanfaux", "@TriumphLife360", "@UA_Athletics","@DrSlotsStakeUS",
    "@TopSpeedLLC", "@sells_tom", "@DaDverhulst", "@BDoris92267478", "@GrantCardone", "@therealworld_ai", "@RealCandaceO", "@engineers_feed", "@premierleague",
    "@FortniteGame", "@wtfyummi", "@joaocpp1997", "@HomestuckOdd", "@ManUtd", "@_JHokanson", "@Tam_Khan", "@crypoqback", "@iamdannex",
    "@ReachMorpheuss", "@neuralink", "@chainlink", "@PrimeHydrate", "@MattWalshBlog", "litecoin", "@Uniswap", "@Nohelema", "@KimboFlight",
    "@0xBEMichael", "@bummiearo", "@FulfillmentPet1", "@takeafootnote", "@alii3910", "@ChandlerHallow"]
    
    accounts: list[str] = non_famous + famous_accounts
    
    for account in accounts:
        account.replace("@", "")
        
    crawl_scheduler = CrawlerScheduler(accounts, Config.crawler_threads())
    summary_results = crawl_scheduler.start()
    db.add_crawl_summary(summary_results)
    compress_backups()
    remove_backup_files()


crawl_job()
"""
schedule.every().day.at("19:04").do(crawl_job,)
while True:
    schedule.run_pending()
    time.sleep(10)
"""
