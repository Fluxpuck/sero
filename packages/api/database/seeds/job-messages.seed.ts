import { JobMessages } from '../../models';
import { logger } from '../../utils/logger';

/**
 * Seed job messages with default job messages
 * Migrated from job-messages.js
 */
export async function seedJobMessages() {
    try {
        // Define job messages from the job-messages.js file
        const jobMessages = {
            "1": [
                `You worked as a veternarian and saved a horse! 🐴 \nYou recieved {COIN} for your service.`,
                `As a veternarian you were forced to clean up dog poop. 💩 \nYou recieved {COIN} coins for your trouble.`,
                `You took care of an injured dog! 🐶 \nYou recieved {COIN} coins for your service.`,
                `You helped bathe a dog because he was covered in mud! 🛁 \nThe owner of the dog gave you {COIN} coins.`,
                `Successfully transformed a grumpy cat into a purring ball of fluff. 🐱 \nThe owner paid the fluff tax: {COIN} coins.`,
                `Performed a duck's annual check-up. It quacked me up! 🦆 \nThe owner paid the Duck bill: {COIN} coins.`,
                `Your dog was mooing like a cow you said ma'am? Oh, then it probably is a dog. \nYou recieved {COIN} coins.`,
                `Huh, you found a dog named seven, interesting... \nYou recieved {COIN} coins.`
            ],
            "2": [
                `You worked as a astronaut and found a fluxtuating planet. \nYou recieved {COIN} coins. 🌌`,
                `As a astronaut you discovered a new planet called Planet 7, very cool! 🪐\n You've been awarded {COIN} coins.`,
                `You worked as a astronaut and visited planet Zeus. 🚀 \nYou recieved {COIN} coins!`,
                `Oxygen levels are low, but you managed to reach the NOS-station! \nHere is {COIN} coins for your troubles.`,
                `Houston! You found a black hole, but you're okay. 🕳️ \nYou recieved {COIN} coins.`,
                `You tried the moonwalk on the moon, but you just fell over. \nHere is {COIN} coins.`,
                `You tried to make a moon base, but you ran out of cheese. 🧀 \nYou recieved {COIN} coins.`
            ],
            "3": [
                `Your brilliant strategy won the firm a high-profile case! 🎉 \nAs a bonus, {COIN} coins were added to your account.`,
                `Successfully defended a client in court with a stellar argument. ⚖️ \nThe firm rewarded you with {COIN} coins.`,
                `After a day of diving into legal books and researching for a case. \nYou earned {COIN} coins.`,
                `Negotiated a fantastic settlement for a client, leaving them thrilled. 🤝 \nYour reward: {COIN} coins.`,
                `You lost a case, but learned some valuable lessons. \nHere is {COIN} coins.`,
                `Spent the day meticulously drafting contracts, ensuring every detail was perfect. 📝 \nCollected {COIN} coins for your efforts.`,
                `Provided peace of mind for a client by helping with their will. 🏡 \nYou received {COIN} coins.`,
                `Empowered a client with knowledge by advising them on their legal rights. 📜 \nEarned {COIN} coins.`,
                `Passionately argued a case in court all day, showcasing your skills. 🏛️ \nYou were rewarded with {COIN} coins.`,
                `Paved the way for a client's success by helping them set up a new business. 💼 \nYou received {COIN} coins.`
            ],
            "4": [
                `Found a mistake in the books! 📚 \nYour keen eye earned you {COIN} coins.`,
                `Balanced the books so well, they could walk a tightrope. \nYour reward: {COIN} coins.`,
                `Discovered a hidden tax deduction, like finding Waldo in a sea of numbers. \n{COIN} coins were added to your account.`,
                `Cracked the code on a complex financial statement, like The Da Vinci Code but with more numbers. 🧩 \nYou received {COIN} coins.`,
                `Saved a client from a tax audit, like a knight in shining armor but with a calculator. \n{COIN} coins were your reward.`,
                `Found an error in the financial statements that everyone else missed. Sherlock has nothing on you. 🕵️‍♂️ \nYou received {COIN} coins.`,
                `Checked all the numbers and everything seems well. There's some room to buy a new calculator. \n{COIN} coins were earned.`
            ],
            "5": [
                `You worked as a Developer and found a bug in the code! 🐛 \nYou received {COIN} coins.`,
                `You just sat there behind the desk and did nothing, but you still got paid {COIN} coins.`,
                `You made a new application for a client and they paid you {COIN} coins, less than you expected for all the revisions...`,
                `You decided to spend the day adding easter eggs to the company's website. 🥚 \nYou got paid {COIN} coins.`,
                `You found a security vulnerability, but it's someone else's problem now. 🔒 \nYou received {COIN} coins.`,
                `You turn bugs into features like a true magician! 🎩 \nYou received {COIN} coins.`
            ],
            "6": [
                `You worked as a teacher taught a student how to read! 📖 \nYou received {COIN} coins.`,
                `You made a student cry because of your teaching methods, but you still got paid {COIN} coins.`,
                `You taught a student how to write their name! ✍️ \nYou received {COIN} coins.`,
                `You still haven't graded the test papers, but you still got paid {COIN} coins.`,
                `You had to raise the average grade of the class, you should probably sit on a table next time you see that class. \nYou received {COIN} coins.`,
                `You let your students do what they wanted in class, maybe tell them to do something next time though. \nYou received {COIN} coins.`
            ],
            "7": [
                `Wrote a ticket for a car parked in a no parking zone. 🚓 \nEarned {COIN} coins for your diligence.`,
                `Caught a jaywalker in the act, like a game of red light, green light. \n{COIN} coins were added to your account.`,
                `Chased down a purse snatcher, felt like a scene straight out of a movie. 🎬 \nYou received {COIN} coins.`,
                `Helped an old lady cross the street. Not all heroes wear capes. \n{COIN} coins were your reward.`,
                `Diffused a tense situation with your negotiation skills. It was like a chess game, but with more talking. \nYou earned {COIN} coins.`,
                `Caught a graffiti artist red-handed, or should I say, paint-handed. 🎨 \nYou received {COIN} coins.`,
                `Found a lost child in the park and reunited them with their parents. \n{COIN} coins were added to your account.`,
                `Patrolled the neighborhood and it was quiet... too quiet. \nYou received {COIN} coins.`
            ],
            "8": [
                `Sold a car! 🚗 Your sales skills earned you {COIN} coins.`,
                `Managed to sell a vacuum cleaner that sucks more than a black hole. \n{COIN} coins were added to your account.`,
                `Convinced a customer to buy a fridge... for their igloo. 🧊 \nYou received {COIN} coins.`,
                `Sold a pair of sunglasses to a bat. \nEarned {COIN} coins for your effort.`,
                `Sold a treadmill to a snail, talk about an uphill battle. 🐌 \nYou received {COIN} coins.`,
                `Sold a pen to a man who said he didn't need one. \n{COIN} coins were your reward.`,
                `Sold a boat to a man in the desert, he said he's preparing for global warming. \nYou received {COIN} coins.`,
                `Sold a comb to a bald man, he said it's for his cat. 🐱 \nYou received {COIN} coins.`
            ],
            "9": [
                `Booked a trip to Hawaii for a customer! 🌺 \n{COIN} coins were added to your account.`,
                `Arranged a trip to the moon for a customer who wanted to get away from it all. 🌕 \nYou received {COIN} coins.`,
                `Organized a trip to the Bermuda Triangle for a customer who wanted to get lost. \nEarned {COIN} coins.`,
                `Sent a customer to Antarctica because they love penguins. 🐧 \nYou received {COIN} coins.`,
                `Booked a trip to the Sahara for a customer who needed a tan. \n{COIN} coins were your reward.`,
                `Arranged a trip to the Amazon for a customer who wanted to meet Tarzan. 🦧 \nYou received {COIN} coins.`,
                `Organized a trip to the Great Wall of China for a customer who needed to stretch their legs. \nEarned {COIN} coins.`,
                `Booked a trip to the bottom of the ocean for a customer looking for Nemo. 🐠 \nYou received {COIN} coins.`
            ],
            "10": [
                `Victory! You won a gold medal! 🥇 \n{COIN} coins were added to your account.`,
                `Secured a silver medal. 🥈 \nYou received {COIN} coins.`,
                `Bronze medal achieved! Third time's the charm... or is it? 🥉 \nYou received {COIN} coins.`,
                `Participation trophy awarded. Hm? Oh, you want coins too? Fine, \nyou received {COIN} coins.`,
                `Battled T in an e-sports game, but victory wasn't in the cards. 🎮 \nYou received {COIN} coins for trying!`,
                `You won a chess match against a pigeon. 🐦 \nYou received {COIN} coins.`
            ],
            "11": [
                `Your Minecraft video blew up, getting over 1 million views! 🎉 \n Ads revenue was {COIN} coins`,
                `Made a Minecraft lets play video and got 10 views. Please give up! \nYou received {COIN} coins.`,
                `Played Among Us with some buddies, and your video got a lot of comments! 🛸 \nEarned {COIN} coins.`,
                `Created a video essay on your favorite game, it took a while to make. \nYou received {COIN} coins.`,
                `Hired a team of programmers to make some custom mods for Among Us. Your videos are doing good! 👾 \nYou received {COIN} coins.`,
                `Made a video on how to make a redstone contraption, featuring Zakaria. 🛠️ \nYou received {COIN} coins.`,
                `Took a break from making videos, but you still get paid {COIN} coins. Thank god for ad revenue.`
            ],
            "12": [
                `Featured in the girls magazine "Wex"! 📸 \nYour modeling skills earned you {COIN} coins.`,
                `Photoshoot for Zeus Couture was a success, they appreciated your work. \n You recieved {COIN} coins.`,
                `Photoshoot for a Sunscreen company, they had to cover your sunburns with makeup. 🌞 \nEarned {COIN} coins.`,
                `Wore your best shoes for a photoshoot, but they were never in the shot. 😞 \nYou received {COIN} coins.`,
                `Photoshoot for a sunglasses company, they said you looked cool. 😎 \nYou received {COIN} coins.`,
                `Photoshoot for a watch company, they said you were on time. ⌚ \nYou received {COIN} coins.`,
                `Posed for a painting, the artist said you were a masterpiece. 🎨 \nYou received {COIN} coins.`,
                `Tripped twice on the catwalk, but you still got paid {COIN} coins.`,
                `You were the star of the show 🌟 \nYou got paid {COIN} coins.`
            ],
            "13": [
                `Practiced surgery on a grape! 🍇 \nEarned {COIN} coins for your precision.`,
                `Heart transplant successful, the patient is doing well! ❤️ \nYou received {COIN} coins.`,
                `Tested your patience with a patient, but still got paid {COIN} coins.`,
                `Found a note inside the patient during an incision: "Don't forget to feed the cat." 📝 \nYou received {COIN} coins.`,
                `Procrastinated on paperwork with your assistant Igbar, but still got paid {COIN} coins.`,
                `Performed surgery on a banana, it was a-peeling. 🍌 \nYou received {COIN} coins.`,
                `You were the doctor on duty, but you were off duty. \nYou still got paid {COIN} coins.`
            ],
            "14": [
                `Commissioned to make a logo for a company, and they loved it! 🎨 \nEarned {COIN} coins.`,
                `Revised a commission 7 times, but still got paid {COIN} coins.`,
                `Your graffiti is the talk of the town! 🏙️ \nYou received {COIN} coins.`,
                `Painted a self-portrait so realistic that your mirror got jealous. 🖼️ \nEarned {COIN} coins.`,
                `Tried to paint a sunset, but it ended up looking like a fruit salad. \nStill, you received {COIN} coins.`,
                `Painted a masterpiece, but your dog walked across it. Now it's modern art! 🐾 \nYou received {COIN} coins.`,
                `Painted a portrait of a cat, but it looked more like a potato. 🥔 \nYou received {COIN} coins.`
            ],
            "15": [
                `Prepared a delicious meal for a customer! 🍽️ \nEarned {COIN} coins for your culinary skills.`,
                `Made a meal for a customer, but they didn't like it. \nStill got paid {COIN} coins.`,
                `Played with fire and got burned, setting the kitchen on fire. 🔥 \nYou did put it out though, and received {COIN} coins.`,
                `Invented a new dish called the "Fluxpuck special". 🍲 \nYou received {COIN} coins.`,
                `Had the day off, but still cooked up something divine. \nEarned {COIN} coins.`,
                `A food critic visited your restaurant. Let's hope they liked your food. 🍴 \nYou received {COIN} coins.`
            ],
            "16": [
                `Flew a plane over the Bermuda Triangle. How'd you even end up over there? 🛩️ \nReceived {COIN} coins and an interview for somehow surviving.`,
                `Made an emergency landing, but everyone is safe. 🛬 \nYou received {COIN} coins.`,
                `Plane was overbooked, making it a long day. \nEarned {COIN} coins for your patience.`,
                `Flew through a storm, but kept everyone safe. 🌩️ \nYou received {COIN} coins.`,
                `Next flight is delayed, giving you some time to relax. \nEarned {COIN} coins.`,
                `Turbulence hit, but you managed to keep the plane steady. 🌪️ \nYou received {COIN} coins.`
            ],
            "17": [
                `Fixed some leaky pipes as a plumber. \nReceived {COIN} coins from the homeowner.`,
                `Her wedding ring fell down the drain, but you managed to get it back. 💍 \nReceived {COIN} coins for your efforts.`,
                `Turned a dripping sink into a masterpiece. \nReceived {COIN} coins for your work.`,
                `Cleared out the clogged toilet like a superhero in a porcelain cape. 🦸‍♂️ \nGot paid {COIN}.`,
                `Someone dropped a massive deuce into the toilet, needing more than a plunger to get it out. 🚽 \nThe homeowner paid {COIN} coins.`,
                `How do you drop a Barbie doll down the drain, ma'am? \nYou got paid {COIN} coins.`,
                `Sink was dripping in morse code, spelling out "Pay the plumber." \nThe owner paid for the decoding fee: {COIN} coins.`,
                `Checked for leaks, found one, and named it Cali. \nThe homeowner paid for Cali's therapy: {COIN} coins.`,
                `Fixed a leaky faucet, but the homeowner said it was too quiet now. 🚰 \nYou received {COIN} coins.`
            ],
            "18": [
                `Set up a smart home system. Now the house is smarter than its owner. \nEarned {COIN} IQ points... er, coins.`,
                `Installed EV charging stations. Cars are happily slurping electrons. \nYou're {COIN} coins richer.`,
                `Fixed a short circuit. Grumpy appliances are working again. 🔌 \nFamily paid {COIN} coins, no shorts.`,
                `Repaired post-lightning strike damage. Mother Nature's destructive, but you're {COIN} coins constructive.`,
                `Fixed flickering lights in a "haunted" house. 👻 Ghosts are furious, but you pocketed {COIN} coins.`,
                `Installed solar panels. Sun's out, funds out! ☀️ \nBrightened your day with {COIN} coins.`,
                `Got hit by lightning, unrelated to your job but it happened. 🌩️ \nYou received {COIN} coins.`,
                `Installed a new light fixture, but the homeowner said it was too bright. 💡 \nEarned {COIN} coins.`,
                `Got zapped. ⚡ That's it. \nYou got paid {COIN} coins.`
            ],
            "19": [
                `Rescued a cat from a tree! 🐱 \nYou received {COIN} coins for your bravery.`,
                `Put out a kitchen fire before it spread to the rest of the house. 🔥 \nEarned {COIN} coins for your quick action.`,
                `Helped evacuate a building during a fire drill. No actual fire, but good practice! \nYou received {COIN} coins.`,
                `Rescued a family from a burning building. You're a hero! 🦸‍♂️ \nReceived {COIN} coins as a token of appreciation.`,
                `Gave a fire safety presentation at a local school. The kids loved your demonstration! 👨‍🏫 \nYou earned {COIN} coins.`,
                `Responded to a false alarm. Better safe than sorry! \nStill got paid {COIN} coins.`,
                `Saved a dog from a burning building. The owner was very grateful! 🐶 \nYou received {COIN} coins.`
            ],
            "20": [
                `Helped a patient recover from surgery. They're feeling much better now! 💉 \nYou earned {COIN} coins.`,
                `Administered medication to patients all day. Your feet are killing you! 👣 \nReceived {COIN} coins for your hard work.`,
                `Comforted a scared child before their procedure. You made a difference! 🧸 \nEarned {COIN} coins.`,
                `Organized the medicine cabinet. Everything is in its place now! 🧪 \nYou received {COIN} coins.`,
                `Worked a double shift because another nurse called in sick. You're exhausted! 😴 \nEarned {COIN} coins for going above and beyond.`,
                `Helped deliver a baby! It's a beautiful moment you'll never forget. 👶 \nReceived {COIN} coins for your assistance.`,
                `Trained a new nurse on hospital procedures. You're a great mentor! 👩‍⚕️ \nYou earned {COIN} coins.`
            ],
            "21": [
                `Designed a beautiful house that the client loved! 🏠 \nYou earned {COIN} coins for your creativity.`,
                `Created plans for a new skyscraper. It's going to be the tallest in the city! 🏙️ \nReceived {COIN} coins for your design.`,
                `Revised blueprints for a client who keeps changing their mind. Patience is a virtue! 📝 \nEarned {COIN} coins.`,
                `Designed an eco-friendly building that will save energy and reduce carbon footprint. 🌱 \nYou received {COIN} coins.`,
                `Won an architecture competition with your innovative design! 🏆 \nEarned {COIN} coins as a bonus.`,
                `Met with clients to discuss their dream home. You have a lot of work ahead! 🛋️ \nReceived {COIN} coins for the consultation.`,
                `Fixed a design flaw before construction began. Crisis averted! ⚠️ \nYou earned {COIN} coins.`
            ],
            "22": [
                `Broke a major news story! Your article is on the front page! 📰 \nYou earned {COIN} coins.`,
                `Interviewed a celebrity for a feature article. They were surprisingly down-to-earth! 🎭 \nReceived {COIN} coins for your work.`,
                `Covered a local event that turned out to be more interesting than expected. \nEarned {COIN} coins for your reporting.`,
                `Investigated a corruption scandal. Your exposé is making waves! 🔍 \nYou received {COIN} coins.`,
                `Wrote a heartwarming human interest story that brought tears to readers' eyes. 😢 \nEarned {COIN} coins.`,
                `Met a tight deadline for a breaking news story. The pressure was intense! ⏰ \nReceived {COIN} coins for your quick work.`,
                `Your article went viral online! Everyone's talking about it! 🌐 \nYou earned {COIN} coins.`
            ],
            "23": [
                `Captured a stunning sunset that will be featured in a magazine! 🌅 \nYou earned {COIN} coins for your beautiful photo.`,
                `Shot a wedding and captured moments the couple will cherish forever. 💒 \nReceived {COIN} coins for your services.`,
                `Photographed wildlife in their natural habitat. That squirrel was particularly photogenic! 🐿️ \nEarned {COIN} coins.`,
                `Did a photoshoot for a family with three energetic kids. It was chaos but you got some great shots! 👨‍👩‍👧‍👦 \nYou received {COIN} coins.`,
                `Your photograph won a contest! Your work is being recognized! 🏆 \nEarned {COIN} coins as a prize.`,
                `Spent the day editing photos. Your eyes are tired but the results are worth it! 👁️ \nReceived {COIN} coins.`,
                `Photographed a rare bird that ornithologists are excited about! 🦜 \nYou earned {COIN} coins.`
            ],
            "24": [
                `Fixed a cavity for a nervous patient. They weren't as scared as they thought they'd be! 🦷 \nYou earned {COIN} coins.`,
                `Performed a root canal. It went smoothly despite being complicated. \nReceived {COIN} coins for your expertise.`,
                `Gave a child their first dental check-up. They were so brave! 🧒 \nEarned {COIN} coins.`,
                `Whitened a patient's teeth. Their smile is dazzling now! ✨ \nYou received {COIN} coins.`,
                `Extracted a wisdom tooth that was causing problems. The patient is relieved it's out! \nEarned {COIN} coins.`,
                `Fitted braces for a teenager. They'll thank you in a couple of years! \nReceived {COIN} coins for your work.`,
                `Gave a presentation on dental hygiene at a local school. The kids loved the toothbrushes you handed out! 🪥 \nYou earned {COIN} coins.`
            ],
            "25": [
                `Helped a patient work through a difficult emotional issue. They made a breakthrough today! 🧠 \nYou earned {COIN} coins.`,
                `Conducted a therapy session that went particularly well. Your patient is making progress! \nReceived {COIN} coins.`,
                `Administered psychological tests and analyzed the results. \nEarned {COIN} coins for your assessment.`,
                `Counseled a couple through relationship difficulties. Communication is key! 💑 \nYou received {COIN} coins.`,
                `Helped a patient develop coping strategies for anxiety. They're feeling more in control now! \nEarned {COIN} coins.`,
                `Wrote up case notes and treatment plans all day. Paperwork is never-ending! 📋 \nReceived {COIN} coins.`,
                `Your research paper on cognitive behavioral therapy was published in a prestigious journal! 📚 \nYou earned {COIN} coins.`
            ],
            "26": [
                `Fixed a car that wouldn't start. It was just a loose battery connection! 🔋 \nYou earned {COIN} coins.`,
                `Changed the oil and filters on five cars today. Your hands are filthy but the cars are running smoothly! 🛢️ \nReceived {COIN} coins.`,
                `Diagnosed a strange noise in a car's engine. Your ears are well-trained! 👂 \nEarned {COIN} coins.`,
                `Replaced worn-out brake pads just in time. Safety first! 🛑 \nYou received {COIN} coins.`,
                `Restored a classic car to its former glory. It's a beauty! 🚗 \nEarned {COIN} coins for your craftsmanship.`,
                `Fixed a flat tire for a stranded motorist. They were very grateful! \nReceived {COIN} coins for your help.`,
                `Tuned up a car's engine for optimal performance. It's purring like a kitten now! 😺 \nYou earned {COIN} coins.`
            ],
            "27": [
                `Harvested a bumper crop of corn! It's been a good season. 🌽 \nYou earned {COIN} coins.`,
                `Milked the cows at dawn. It's hard work but someone's got to do it! 🐄 \nReceived {COIN} coins.`,
                `Planted new crops in the field. Looking forward to watching them grow! 🌱 \nEarned {COIN} coins.`,
                `Fixed the tractor that broke down in the middle of the field. Back to work now! 🚜 \nYou received {COIN} coins.`,
                `Sold your produce at the farmers' market. Everything was fresh and delicious! 🍅 \nEarned {COIN} coins.`,
                `Tended to the chickens and collected eggs. One of the hens was particularly broody today! 🐔 \nReceived {COIN} coins.`,
                `Built a new fence to keep the sheep in their pasture. No escapees today! 🐑 \nYou earned {COIN} coins.`
            ],
            "28": [
                `Helped a student find the perfect book for their research paper. They were so grateful! 📚 \nYou earned {COIN} coins.`,
                `Organized a reading event for children. The kids loved the story time! 📖 \nReceived {COIN} coins.`,
                `Cataloged new books that just arrived at the library. So many exciting titles! \nEarned {COIN} coins.`,
                `Assisted a patron with using the computer for job applications. Technology can be tricky! 💻 \nYou received {COIN} coins.`,
                `Hosted a book club discussion that went particularly well. Great insights from everyone! \nEarned {COIN} coins.`,
                `Repaired damaged books to extend their shelf life. A little tape works wonders! 📔 \nReceived {COIN} coins.`,
                `Created a new display featuring local authors. It's drawing a lot of attention! \nYou earned {COIN} coins.`
            ],
            "29": [
                `Filled prescriptions accurately and efficiently all day. Attention to detail is crucial! 💊 \nYou earned {COIN} coins.`,
                `Advised a patient on how to take their medication properly. They appreciated your clear instructions! \nReceived {COIN} coins.`,
                `Spotted a potential drug interaction and contacted the doctor. You may have prevented a serious issue! ⚕️ \nEarned {COIN} coins.`,
                `Compounded a specialized medication for a patient with unique needs. \nYou received {COIN} coins for your expertise.`,
                `Organized the pharmacy inventory. Everything is accounted for! 📋 \nEarned {COIN} coins.`,
                `Administered flu shots all day. Your arm is tired but you're helping prevent illness! 💉 \nReceived {COIN} coins.`,
                `Counseled a patient on managing side effects of their new medication. \nYou earned {COIN} coins.`
            ],
            "30": [
                `Ensured all passengers had a comfortable flight. Your service was impeccable! ✈️ \nYou earned {COIN} coins.`,
                `Handled a medical emergency on board with calm professionalism. \nReceived {COIN} coins for your quick thinking.`,
                `Served meals and drinks to a full flight. Your feet are tired but everyone was fed! 🍽️ \nEarned {COIN} coins.`,
                `Helped a nervous first-time flyer feel at ease. They actually enjoyed the flight! \nYou received {COIN} coins.`,
                `Demonstrated safety procedures with flair. Everyone was paying attention! 🧯 \nEarned {COIN} coins.`,
                `Dealt with a demanding passenger with patience and grace. Your diplomacy skills are top-notch! \nReceived {COIN} coins.`,
                `Assisted a family with young children throughout the flight. The parents were grateful for your help! 👨‍👩‍👧 \nYou earned {COIN} coins.`
            ],
            "31": [
                `Created a logo that the client absolutely loved! 🎨 \nYou earned {COIN} coins for your creativity.`,
                `Designed a website with a user-friendly interface. It looks great and works perfectly! 💻 \nReceived {COIN} coins.`,
                `Made a stunning poster for an upcoming event. It's eye-catching and informative! 📢 \nEarned {COIN} coins.`,
                `Redesigned a company's branding to give them a fresh, modern look. \nYou received {COIN} coins for your work.`,
                `Created illustrations for a children's book. The author was delighted with your whimsical style! 📚 \nEarned {COIN} coins.`,
                `Designed packaging for a new product. It stands out on the shelf! 📦 \nReceived {COIN} coins.`,
                `Your design won an award in a prestigious competition! Recognition for your talent! 🏆 \nYou earned {COIN} coins.`
            ],
            "32": [
                `Helped a family find housing after they lost their home. They have a safe place to stay now! 🏠 \nYou earned {COIN} coins.`,
                `Counseled a teenager going through a difficult time. They're feeling more hopeful now! \nReceived {COIN} coins.`,
                `Connected a client with resources to help them get back on their feet. \nEarned {COIN} coins.`,
                `Advocated for a child in the foster care system. Every child deserves someone in their corner! 👧 \nYou received {COIN} coins.`,
                `Facilitated a support group that had a particularly meaningful session today. \nEarned {COIN} coins.`,
                `Completed mountains of paperwork to ensure your clients get the services they need. 📋 \nReceived {COIN} coins.`,
                `Helped an elderly client navigate complex healthcare systems. They're grateful for your assistance! 👵 \nYou earned {COIN} coins.`
            ],
            "33": [
                `Baked a wedding cake that was the highlight of the reception! 🎂 \nYou earned {COIN} coins for your masterpiece.`,
                `Made fresh bread that sold out within hours. The smell alone brought customers in! 🍞 \nReceived {COIN} coins.`,
                `Created pastries that were featured in a local magazine. You're getting famous! 🥐 \nEarned {COIN} coins.`,
                `Experimented with a new recipe that turned out delicious. It's going on the menu! \nYou received {COIN} coins.`,
                `Decorated cookies for a children's party. They were too cute to eat! 🍪 \nEarned {COIN} coins.`,
                `Taught a baking class where everyone successfully made sourdough bread. \nReceived {COIN} coins for sharing your knowledge.`,
                `Won a local baking competition with your signature pie! The judges were impressed! 🥧 \nYou earned {COIN} coins.`
            ],
            "34": [
                `Translated an important document perfectly. Your attention to detail is impressive! 📄 \nYou earned {COIN} coins.`,
                `Interpreted for a high-stakes business meeting. Both parties were able to communicate effectively thanks to you! 💼 \nReceived {COIN} coins.`,
                `Translated a novel that will be published next month. Your name will be in the credits! 📚 \nEarned {COIN} coins.`,
                `Helped a tourist who was lost and couldn't speak the local language. They were so relieved! 🗺️ \nYou received {COIN} coins.`,
                `Subtitled a foreign film with nuance and accuracy. The director specifically complimented your work! 🎬 \nEarned {COIN} coins.`,
                `Taught a language class where your students made great progress. You're a natural teacher! 👨‍🏫 \nReceived {COIN} coins.`,
                `Translated during a medical appointment, ensuring the patient received proper care. \nYou earned {COIN} coins.`
            ],
            "35": [
                `Discovered a new species of fish during your research dive! 🐠 \nYou earned {COIN} coins for your groundbreaking find.`,
                `Collected data on coral reef health. The ecosystem is showing signs of recovery! 🐙 \nReceived {COIN} coins.`,
                `Tagged sharks to track their migration patterns. They're surprisingly docile when you know how to approach them! 🦈 \nEarned {COIN} coins.`,
                `Analyzed water samples for pollution levels. Your research will help protect marine life! 🧪 \nYou received {COIN} coins.`,
                `Gave a presentation on ocean conservation that inspired many to take action. 🌊 \nEarned {COIN} coins.`,
                `Rescued a sea turtle tangled in plastic. It swam away happily after you freed it! 🐢 \nReceived {COIN} coins.`,
                `Published a research paper on the effects of climate change on marine ecosystems. \nYou earned {COIN} coins.`
            ],
            "36": [
                `Uncovered ancient artifacts at a dig site! These will help us understand past civilizations better. 🏺 \nYou earned {COIN} coins.`,
                `Carefully excavated a burial site, revealing insights into funeral practices of the past. \nReceived {COIN} coins.`,
                `Analyzed pottery fragments to determine their age and origin. \nEarned {COIN} coins for your meticulous work.`,
                `Discovered cave paintings that are thousands of years old! 🖼️ \nYou received {COIN} coins for your find.`,
                `Reconstructed an ancient tool from fragments. It's now on display in a museum! \nEarned {COIN} coins.`,
                `Taught students about archaeological methods during a field school. \nReceived {COIN} coins for sharing your knowledge.`,
                `Found a well-preserved fossil that adds to our understanding of prehistoric life. 🦴 \nYou earned {COIN} coins.`
            ],
            "37": [
                `Accurately predicted a major storm, allowing people to prepare in advance. 🌧️ \nYou earned {COIN} coins.`,
                `Analyzed weather patterns to create a forecast for the upcoming week. \nReceived {COIN} coins.`,
                `Tracked a hurricane's path, providing crucial updates to affected areas. 🌀 \nEarned {COIN} coins.`,
                `Studied climate data to identify long-term trends. Your research is valuable! 📊 \nYou received {COIN} coins.`,
                `Gave a weather report on live television without any mistakes! 📺 \nEarned {COIN} coins.`,
                `Used advanced technology to detect a tornado forming, allowing for early warnings. 🌪️ \nReceived {COIN} coins.`,
                `Collaborated with emergency services to prepare for extreme weather events. \nYou earned {COIN} coins.`
            ]
        };

        // Create job messages
        let count = 0;
        for (const [jobId, messages] of Object.entries(jobMessages)) {
            for (const message of messages) {
                await JobMessages.create({
                    jobId,
                    message
                } as any);
                count++;
            }
        }

        logger.success(`${count} job messages have been seeded successfully.`);
        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error seeding job messages: ${errorMessage}`);
        return { success: false, error };
    }
}
