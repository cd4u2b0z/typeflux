/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Prose Passages
   Real, everyday English — the sentences a hand actually writes
   on a working day. Business correspondence and plain talk, set
   as short coherent passages rather than disjoint lines.
   ═══════════════════════════════════════════════════════════ */

const SENTENCES = {
    // Corporate / working correspondence — email, meetings, the desk.
    business: [
        "Thanks for getting back to me so quickly. I have looked over the proposal and most of it works for our team. Can we set up a short call tomorrow to go through the last few points?",
        "Just a quick heads up that the meeting has been moved to three o'clock. I know that is short notice, so let me know if the new time does not work for you and we can find another slot.",
        "I wanted to follow up on the report we discussed last week. The numbers look solid, but I think we should add a section on the risks before we send it to the client.",
        "Please find the updated budget attached. I have flagged the two line items that went over, and I am happy to walk through them whenever you have a few minutes.",
        "Great work on the presentation today. The client seemed genuinely interested, and they asked some good questions. Let us regroup in the morning to plan our next steps.",
        "I am running about ten minutes late for the standup. Please go ahead and start without me, and I will catch up on anything I miss when I join.",
        "Could you send me the latest version of the slide deck before lunch? I want to review it once more before we share it with the wider team.",
        "We appreciate your patience while we sorted out the shipping issue. Your order is now on its way, and you should receive a tracking number within the next hour.",
        "The new hire starts on Monday, so we should make sure her laptop and accounts are ready by Friday. Can you check with the support team and confirm?",
        "I think we are spending too much time in meetings this quarter. Let us try to keep them shorter and only invite the people who really need to be there.",
        "Thanks again for your feedback on the draft. I have made most of the changes you suggested, and I left a couple of comments where I had a question.",
        "The deadline is tight, but I believe we can make it if we focus on the core features first. We can always add the smaller extras in a later release.",
        "Let me know if you need anything else from me before the review. I am out of the office on Thursday, but I will be checking my email in the afternoon.",
        "Our quarterly results came in above target, which is great news for the whole team. I want to thank everyone for the hard work and the long hours.",
        "I have scheduled the training session for next Wednesday at ten. It should take about an hour, and there will be time for questions at the end.",
        "Please remember to submit your expense reports by the end of the month. If any of your receipts are missing, reach out to the finance team as soon as you can.",
        "The customer raised a fair point about our delivery times. We should look at the process and see if there is a way to make it faster without raising costs.",
        "I am attaching the notes from this morning so everyone is on the same page. If I missed anything important, please reply to the thread and add it.",
        "We have decided to push the launch back by two weeks. This gives us more time to test the product and fix the bugs that came up in the last review.",
        "Welcome to the team. Your first week will be mostly meetings and setup, so do not worry about getting much done. Ask plenty of questions while everything is still new."
    ],

    // Plain, day to day talk — the kind of thing you actually say.
    everyday: [
        "I was thinking we could try that new place down the street for dinner tonight. I have heard good things about it, and it would be nice to get out of the house for a while.",
        "Do not forget to pick up milk and bread on your way home. The store closes early on Sundays, so you might want to leave a little sooner than usual.",
        "The weather has been so strange this week. It was warm and sunny yesterday, and now it looks like it might rain all afternoon. I never know what to wear.",
        "I finally finished the book you lent me, and I really enjoyed it. The ending caught me by surprise. Let me know if you have any others I should read.",
        "We should plan something for the weekend before it fills up. Maybe a hike if the weather is nice, or we could just stay in and watch a few movies.",
        "Thank you so much for helping me move last weekend. I could not have done it without you. Let me buy you lunch sometime soon to say thanks.",
        "My phone has been acting up all day. The battery drains so fast now, and half the apps freeze when I open them. I think it might be time for a new one.",
        "The kids have been asking to go to the park all morning. If the rain holds off, I will take them after lunch so they can burn off some energy.",
        "I tried that recipe you sent me, and it turned out really well. I added a little extra garlic because we like it, and everyone went back for seconds.",
        "Traffic was terrible on the way in this morning. There was an accident on the main road, so I had to take the long way around and still ended up late.",
        "Let us catch up properly soon. It feels like it has been months since we had a real conversation. Are you free for a coffee sometime next week?",
        "I have been trying to get to bed earlier, but it is harder than it sounds. There is always one more thing to do, and then it is already past midnight.",
        "The garden is finally starting to look the way I wanted. The tomatoes are coming in nicely, and the flowers we planted in spring are blooming all at once.",
        "I am not sure what to get my brother for his birthday. He says he does not want anything, but I would still like to find him a small surprise.",
        "We ran out of coffee this morning, and you would think the world had ended. I will grab some on the way home so tomorrow goes a little more smoothly.",
        "It was so good to see everyone last night. We stayed up far too late talking, but it was worth it. We really should do that more often.",
        "I keep meaning to call the doctor and book that appointment. I will do it first thing tomorrow, before I get caught up in everything else and forget again.",
        "The dog has way too much energy today. He has been pacing by the door for an hour, so I think a long walk after dinner is the only thing that will help.",
        "I cleaned out the closet this afternoon and found things I had not seen in years. It is amazing how much you can hold on to without ever noticing.",
        "Let me know when you are close and I will start the kettle. There is no rush at all, so take your time and drive safely if the roads are still wet."
    ]
};

// Prose passage utilities — mirrors QuoteGenerator's shape so the
// app can treat a passage like any other body of text.
const SentenceGenerator = {
    all() {
        return [...SENTENCES.business, ...SENTENCES.everyday];
    },

    // Return one coherent passage at random.
    getAny() {
        const pool = this.all();
        return { text: pool[Math.floor(Math.random() * pool.length)] };
    }
};
