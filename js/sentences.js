/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Prose Passages
   Real, everyday English — the sentences a hand actually writes
   on a working day. Business correspondence and plain talk, set
   as short coherent passages rather than disjoint lines.
   ═══════════════════════════════════════════════════════════ */

const SENTENCES = {
    // Corporate / working correspondence — email, meetings, the desk.
    business: [
        "I reviewed the proposal before lunch, and the remaining questions are listed at the top of the thread.",
        "Please review the invoice when the new estimate arrives; the sections that need a decision are already marked.",
        "The team revised the risk list, then added a short note explaining what changed and why it matters.",
        "The next step is to align on the forecast once procurement responds, so no one is surprised during the handoff.",
        "The manager found one issue in the legal comment, but it should be easy to resolve once the owner confirms the detail.",
        "Thanks for the quick response; support will update the expense file and send a clean version before the handoff call.",
        "The meeting can stay short if everyone reads the renewal form first and brings only the decisions that need discussion.",
        "The work is waiting on the change request, but the rest can continue without blocking the team.",
        "The vendor organized the timeline because the deadline moved and the old assumptions no longer hold.",
        "Before the call, the reviewer will compare the support ticket against the notes and send any gaps after the finance check.",
        "The client asked for a clearer summary, so the analyst noted the delivery window with the risks in plain language.",
        "If the numbers still look right once the contract is countersigned, the coordinator can treat the product brief as ready for signoff.",
        "If the numbers still look right after the data export finishes, the help desk can treat the change request as ready for signoff.",
        "Thanks for the quick response; procurement will update the status update and send a clean version after the morning call.",
        "Before the call, the delivery team will compare the risk list against the notes and send any gaps after the workshop ends.",
        "Thanks for the quick response; the workshop host will update the support ticket and send a clean version before lunch.",
        "Before the call, the client will compare the status update against the notes and send any gaps when the support queue clears.",
        "If the numbers still look right once the numbers settle, support can treat the proposal as ready for signoff.",
        "Before the call, the lead will compare the support ticket against the notes and send any gaps before the manager returns.",
        "Thanks for the quick response; the help desk will update the risk list and send a clean version after the last comment is addressed.",
        "Before the call, the service desk will compare the renewal form against the notes and send any gaps once the issue is reproduced.",
        "Thanks for the quick response; the executive sponsor will update the status update and send a clean version before it goes to the client.",
        "Before the call, the support lead will compare the risk list against the notes and send any gaps after the checklist is signed.",
        "If the numbers still look right once legal signs off, the workshop host can treat the legal comment as ready for signoff.",
        "Before the call, the vendor will compare the status update against the notes and send any gaps when the client confirms scope.",
        "Thanks for the quick response; the account owner will update the renewal form and send a clean version when the dashboard refreshes.",
        "Before the call, legal will compare the delivery window against the notes and send any gaps before lunch.",
        "Thanks for the quick response; the account team will update the risk list and send a clean version after support confirms the fix.",
        "Before the call, the planning desk will compare the renewal form against the notes and send any gaps once the contract is countersigned.",
        "If the numbers still look right once the vendor replies, the executive sponsor can treat the timeline as ready for signoff.",
        "Before the call, the team will compare the risk list against the notes and send any gaps after the data export finishes.",
        "Thanks for the quick response; the analyst will update the delivery window and send a clean version when the final data comes in.",
        "Before the call, the lead will compare the scope document against the notes and send any gaps once the numbers settle.",
        "Thanks for the quick response; the product owner will update the renewal form and send a clean version before Friday afternoon.",
        "If the numbers still look right once the blockers are clear, the account team can treat the release memo as ready for signoff.",
        "Before the call, the release manager will compare the renewal form against the notes and send any gaps ahead of the review.",
        "Thanks for the quick response; the manager will update the scope document and send a clean version after the customer meeting.",
        "Before the call, the vendor will compare the forecast against the notes and send any gaps before the wider team sees it.",
        "Before the call, the sales desk will compare the scope document against the notes and send any gaps once legal signs off.",
        "If the numbers still look right when the draft is approved, the product owner can treat the invoice as ready for signoff.",
        "Thanks for the quick response; the vendor contact will update the forecast and send a clean version before the next sprint starts.",
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
        "I picked up the groceries before the rain started, and the whole day felt a little easier after that.",
        "We meant to handle the keys earlier, but it finally got done while the kettle boiled.",
        "It was nice to have the birthday card ready when the street got busy, especially after the week had been so full.",
        "The kids laughed about the travel bag, then told the story twice more before anyone left.",
        "The plan changed before the errands started, so our neighbor kept it simple and saved the lunch boxes for later.",
        "My friend put the tomato plants by the door so it would not be forgotten in the morning.",
        "Everyone slowed down on the way home, and even the window screens seemed less urgent for a while.",
        "Mom did not need much, just the hallway shelf, a quiet room, and a little time to breathe.",
        "The family checked a good book twice after the appointment, then decided it was good enough to leave alone.",
        "The house felt calmer before the guests knocked, especially after my brother finally dealt with the movie tickets.",
        "Nobody made a big deal of it, but the group handling the front room changed the mood of the evening.",
        "Everyone promised to bring the winter coat next time, since it would have helped when the morning finally slowed.",
        "The guests meant to handle the blue sweater earlier, but it finally got done before the weekend filled up.",
        "The plan changed once the traffic cleared, so the couple next door kept it simple and saved the keys for later.",
        "The house felt calmer before the guests knocked, especially after my aunt finally dealt with the tomato plants.",
        "The coach promised to bring the hallway shelf next time, since it would have helped after the last box was unpacked.",
        "The new neighbor meant to handle the movie tickets earlier, but it finally got done after the store opened.",
        "The plan changed after the first cup of coffee, so the delivery driver kept it simple and saved the picnic blanket for later.",
        "The house felt calmer after the dishes were done, especially after the little one finally dealt with the birthday card.",
        "The plan changed when the lights flickered, so the visitors kept it simple and saved a good book for later.",
        "The house felt calmer once the music stopped, especially after the kids finally dealt with the blue sweater.",
        "My friend promised to bring the groceries next time, since it would have helped before dinner.",
        "Mom meant to handle the birthday card earlier, but it finally got done while the bread cooled.",
        "The plan changed before the rain started, so the group kept it simple and saved the tomato plants for later.",
        "The couple next door promised to bring the winter coat next time, since it would have helped on the way home.",
        "My cousin meant to handle the blue sweater earlier, but it finally got done after the appointment.",
        "The house felt calmer once the traffic cleared, especially after my old friend finally dealt with the window screens.",
        "The barista meant to handle the movie tickets earlier, but it finally got done before bedtime.",
        "The shop owner promised to bring the lunch boxes next time, since it would have helped before everyone arrived.",
        "We meant to handle the window screens earlier, but it finally got done once the baby fell asleep.",
        "The plan changed before dinner, so our neighbor kept it simple and saved the movie tickets for later.",
        "My roommate meant to handle the birthday card earlier, but it finally got done while the windows were open.",
        "The house felt calmer before the rain started, especially after my aunt finally dealt with the front room.",
        "The landlord meant to handle the blue sweater earlier, but it finally got done after the game ended.",
        "The bus driver meant to handle the front room earlier, but it finally got done before the errands started.",
        "The plan changed after the long drive, so the visitors kept it simple and saved the blue sweater for later.",
        "Our neighbor promised to bring the lunch boxes next time, since it would have helped after the store opened.",
        "Dad meant to handle the window screens earlier, but it finally got done when the clouds broke.",
        "The house felt calmer before dinner, especially after the driver finally dealt with the school forms.",
        "The repair person meant to handle the birthday card earlier, but it finally got done after the movie finished.",
        "The delivery driver promised to bring the picnic blanket next time, since it would have helped while the bread cooled.",
        "The barista meant to handle the school forms earlier, but it finally got done before the garden dried out.",
        "The plan changed when the street got busy, so the little one kept it simple and saved the birthday card for later.",
        "The visitors promised to bring a good book next time, since it would have helped after the appointment.",
        "The house felt calmer after the long drive, especially after the family finally dealt with the travel bag.",
        "Everyone meant to handle the window screens earlier, but it finally got done while the soup simmered.",
        "The landlord meant to handle the travel bag earlier, but it finally got done as the room warmed up.",
        "The plan changed as the evening settled, so my old friend kept it simple and saved the window screens for later.",
        "The kitchen meant to handle the school forms earlier, but it finally got done before the library closed.",
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
    },

    // Build a body of prose of roughly `targetWords` words by joining
    // distinct passages until the target is met. At least one passage
    // is always returned, so a small target still yields real text.
    getPassage(targetWords = 25) {
        const pool = this.all();
        const picked = [];
        const used = new Set();
        let count = 0;
        while ((count < targetWords || picked.length === 0) && used.size < pool.length) {
            const i = Math.floor(Math.random() * pool.length);
            if (used.has(i)) continue;
            used.add(i);
            picked.push(pool[i]);
            count += pool[i].split(/\s+/).length;
        }
        return { text: picked.join(' ') };
    }
};
