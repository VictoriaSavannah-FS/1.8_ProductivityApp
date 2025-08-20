# Reflection 1.8 - 4.8

## Reflection 1.8

This past week has been both frustrating and eye-opening as I worked through building out the cross-platform app. I’ve actually started from scratch twice already, but I don’t see that as wasted time. In the process, I discovered that the real challenge wasn’t just a single error — it was a combination of version conflicts between Expo and Babel, compatibility issues with dev dependencies like NativeWind v4, and the way my metro.config.js and babel.config.js were configured. For days, I felt like I was caught in an endless loop of bundling errors. It wasn’t until I stepped back and looked at all three together — Expo Router, NativeWind, and Babel — that I realized how they were feeding into each other.

At first, I thought the issue was only with NativeWind because of the infamous “.plugins is not a valid Plugin property” error that came up repeatedly. But after another round of frustration, I noticed that routing through Expo Router and the Babel config were also contributing. Eventually, I stumbled across an article that described the exact symptoms I had been dealing with. That “aha” moment helped me connect the dots and understand the full scope of the problem.

Looking back at my earlier 1.6 exercise, I realized why it had worked so smoothly: I had unintentionally avoided the problem altogether. In that version, I skipped NativeWind/Tailwind, bypassed Expo Router, and used a simple App.tsx at the root as the entry point. That setup was clean and stable across both iOS and web. The moment I reintroduced routing and NativeWind in later builds, everything started breaking again.

## Reflection 2.8

- How did you handle the complexity of managing multiple chat channels?
  It was hard. I had to create the separate channels, set up arrays to store their data, and use a Map() on the server to dynamically store and update the information being passed from the frontend. On top of that, each chat room needed a fallback queue or “library/storage” system to hold messages in case the user went offline. I also had to update the chat database and its tables to include the new schema parameters.

  I ended up asking ChatGPT for help because every time I added @mentions or edited the message schema, it broke everything. The core issue was that my schema updates weren’t being recognized. Eventually, it helped me create a helper function to reinitialize and reload the schema table correctly. Which helped and fixed the rendering errors, and new columns/data are now reflected properly.

- What was most challenging about implementing user presence across channels?
  Making sure each chat room had functions to store and handle user data, track roomId, and manage incoming messages from the server. It was also tough ensuring the services on the frontend passed that data correctly to the components so the UI could render presence indicators. One of the biggest pain points was that small changes in my chatService or UI components would break the entire chatScreen, especially on iOS. Even when I fixed one issue on iOS, it wouldn’t always translate cleanly to the web version.

- How does your offline message handling compare to apps like Slack or Discord?
  Mine is definitely more basic. It doesn’t connect to a large, persistent database—it just stores messages locally, and only up to a certain point. Also, my @mention functionality doesn’t filter messages or notify the user if they’ve been mentioned. To achieve that, I’d need to build a dedicated notification component, a service to filter those messages, and additional UI components to render notifications in real time.

- What would you improve about the user experience with more time?
  Definitely the iOS experience. When I tested it on my phone, I noticed that after typing a message and hitting “Enter” or “Return,” the keyboard didn’t dismiss—it stayed on the screen. I’d like to fix the onPress trigger so the keyboard behaves more naturally and sends the message like in a real chat app. Overall, I would also clean up the UI. Right now, the colors and styling are a bit all over the place—great for development, but not for production. I’d love to create a more consistent theme to give the app a polished, cohesive feel.

- How did you ensure consistent real-time behavior across platforms?
  One of the biggest challenges was making sure that the logic for fetching and rendering user data worked the same on both web and iOS. I had to be really careful with how I used useEffect hooks—especially to avoid any infinite loop issues on mount when pulling messages, typing indicators, and unread message data. I also had to manage when and how those updates triggered so that I didn’t re-render unnecessarily and crash the app(which happened way too much-can't spell).

  Another big part was making sure values like the roomId, userId, and currentUser stayed consistent across both platforms. That way, features like presence indicators and message lists could show the right data, no matter if I was on iOS or web. I had to test a lot to confirm that when a message was sent on iOS, it would still show up immediately on web, and vice versa.

  I was using Socket.IO to send and receive events in real time, and I had to make sure those events were carrying the correct data back to my state. That meant double-checking that the data being emitted (like new messages or user status) matched what the frontend expected to receive and update. It took some trial and error to get everything to sync smoothly, but once the values were consistent and the logic was solid, the real-time updates worked well on both platforms(for the most part.. still some bugs). Paying attention to the details, keeping track of the signal flow is really the hard part with so many moving parts and point of failure.

## Reflection 3.8

Address these questions:

- What was most challenging about third-party API integration?

- How did you handle API key security and Firebase Functions?

- What would you improve with more time?

- What surprised you about device hardware integration?

## Reflection 4.8
