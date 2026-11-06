
/* ==========================================
   PERKPILOT - AI LOYALTY CHATBOT
   Gemini Cloud AI + Built-in Fallback
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // CHATBOT ELEMENTS
    const chatbotToggle =
        document.getElementById("chatbotToggle");

    const chatbotWindow =
        document.getElementById("chatbotWindow");

    const closeChatbot =
        document.getElementById("closeChatbot");

    const chatbotForm =
        document.getElementById("chatbotForm");

    const chatbotInput =
        document.getElementById("chatbotInput");

    const chatbotMessages =
        document.getElementById("chatbotMessages");

    // Existing loyalty programme database
    const loyaltyProgrammes =
        typeof programmes !== "undefined"
            ? programmes
            : [];

    let previousInterests = [];

    // =====================================
    // OPEN AND CLOSE CHATBOT
    // =====================================

    chatbotToggle.addEventListener("click", () => {

        chatbotWindow.hidden = !chatbotWindow.hidden;

        chatbotToggle.setAttribute(
            "aria-expanded",
            String(!chatbotWindow.hidden)
        );

        if (!chatbotWindow.hidden) {
            chatbotInput.focus();
        }
    });

    closeChatbot.addEventListener("click", () => {

        chatbotWindow.hidden = true;

        chatbotToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        chatbotToggle.focus();
    });

    // =====================================
    // DISPLAY CHAT MESSAGES
    // =====================================

    function addMessage(text, sender, links = []) {

        const message = document.createElement("div");

        message.className =
            sender === "user"
                ? "user-message"
                : "bot-message";

        message.textContent = text;

        chatbotMessages.appendChild(message);

        links.forEach(programme => {

            const link = document.createElement("a");

            link.href = programme.website;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            link.textContent =
                "🔗 " + programme.name;

            link.style.display = "block";
            link.style.marginTop = "10px";
            link.style.color = "#67e8f9";

            message.appendChild(link);
        });

        chatbotMessages.scrollTop =
            chatbotMessages.scrollHeight;
    }

    // =====================================
    // DETECT CUSTOMER INTERESTS
    // =====================================

    function detectInterests(message) {

        const categories = {

            movies:
                /\b(movie|movies|cinema|film|films|tickets)\b/i,

            food:
                /\b(food|restaurant|restaurants|dining|coffee|burger|takeaway)\b/i,

            groceries:
                /\b(grocer|groceries|supermarket|checkers|pick n pay)\b/i,

            shopping:
                /\b(shop|shopping|retail|beauty|pharmacy|clicks)\b/i,

            travel:
                /\b(travel|flight|flights|airline|holiday|flying)\b/i,

            fitness:
                /\b(gym|fitness|exercise|health|workout)\b/i
        };

        return Object.entries(categories)
            .filter(([category, pattern]) =>
                pattern.test(message)
            )
            .map(([category]) => category);
    }

    // =====================================
    // BUILT-IN LOYALTY RECOMMENDATIONS
    // =====================================

    function recommendProgrammes(interests, message) {

        const wantsFree =
            /\b(free|no fee|without paying)\b/i.test(message);

        const matches = loyaltyProgrammes
            .filter(programme =>
                interests.some(interest =>
                    programme.interests.includes(interest)
                )
            )
            .filter(programme =>
                !wantsFree ||
                programme.membership === "free"
            )
            .map(programme => ({
                ...programme,

                matchCount: interests.filter(interest =>
                    programme.interests.includes(interest)
                ).length
            }))
            .sort((a, b) =>
                b.matchCount - a.matchCount
            )
            .slice(0, 4);

        if (matches.length === 0) {

            return {
                text:
                    "I couldn't find a suitable match " +
                    "in our current programme list. " +
                    "Try another interest or " +
                    "change your membership preference.",
                links: []
            };
        }

        let reply =
            "💜 Based on your interests, " +
            "here are some programmes worth exploring:\n\n";

        matches.forEach((programme, index) => {

            reply +=
                `${index + 1}. ${programme.icon} ` +
                `${programme.name}\n` +
                `${programme.description}\n` +
                `Membership: ${programme.membership}\n\n`;
        });

        reply +=
            "These are suggestions, not guaranteed " +
            "savings. Always check the provider's " +
            "latest terms and eligibility requirements.";

        return {
            text: reply,
            links: matches
        };
    }

    // =====================================
    // ORIGINAL CHATBOT FALLBACK
    // =====================================

    function generateResponse(message) {

        const text = message.toLowerCase().trim();

        // Greetings
        if (/^(hi|hello|hey|howzit|sup|yo)[!.\s]*$/i.test(text)) {

            return {
                text:
                    "Hey there! 👋💜\n\n" +
                    "Welcome to PerkPilot!\n\n" +
                    "I can help you explore South African " +
                    "loyalty programmes.\n\n" +
                    "Do you enjoy movies, food, shopping, " +
                    "travel or fitness?",
                links: []
            };
        }

        // Thank you
        if (/\b(thanks|thank you|cheers)\b/i.test(text)) {

            return {
                text:
                    "You're welcome! 💜\n\n" +
                    "Happy to help you discover more rewards!",
                links: []
            };
        }

        // Programme name recognition
        const namedProgrammes = loyaltyProgrammes.filter(
            programme => {

                const name = programme.name.toLowerCase();

                return text.includes(name) ||
                    (name.includes("ster-kinekor") &&
                        /ster.kinekor|sk club/.test(text)) ||
                    (name.includes("discovery") &&
                        /vitality|discovery/.test(text)) ||
                    (name.includes("clicks") &&
                        /\bclicks\b/.test(text)) ||
                    (name.includes("starbucks") &&
                        /\bstarbucks\b/.test(text)) ||
                    (name.includes("spur") &&
                        /\bspur\b/.test(text)) ||
                    (name.includes("smart shopper") &&
                        /smart shopper|pick n pay/.test(text)) ||
                    (name.includes("xtra savings") &&
                        /xtra savings|checkers/.test(text)) ||
                    (name.includes("voyager") &&
                        /\bvoyager\b/.test(text));
            }
        );

        if (namedProgrammes.length > 0) {

            let reply = "";

            namedProgrammes.forEach(programme => {

                reply +=
                    `${programme.icon} ${programme.name}\n\n` +
                    `${programme.description}\n\n` +
                    "Benefits to explore:\n" +
                    programme.benefits
                        .map(benefit => `• ${benefit}`)
                        .join("\n") +
                    `\n\nMembership: ${programme.membership}` +
                    `\n${programme.note}\n\n`;
            });

            reply +=
                "Use the official links below to " +
                "check current offers and requirements.";

            return {
                text: reply,
                links: namedProgrammes
            };
        }

        // Detect new interests
        const interests = detectInterests(text);

        if (interests.length > 0) {

            previousInterests = interests;

            return recommendProgrammes(interests, text);
        }

        // Free programme follow-up
        if (
            /\b(free|no fee|without paying)\b/i.test(text) &&
            previousInterests.length > 0
        ) {
            return recommendProgrammes(
                previousInterests,
                "free"
            );
        }

        // Membership costs
        if (/\b(cost|price|membership fee|expensive)\b/i.test(text)) {

            return {
                text:
                    "💰 Some loyalty programmes are free, " +
                    "while others require a paid membership " +
                    "or eligibility through another service.\n\n" +
                    "Tell me which programme you're " +
                    "interested in, and I'll explain " +
                    "what our current information says.",
                links: []
            };
        }

        // Rewards explanation
        if (/\b(points|cashback|discounts)\b/i.test(text)) {

            return {
                text:
                    "💡 Here's the difference:\n\n" +
                    "⭐ Points: Earn rewards through " +
                    "qualifying purchases or activities.\n\n" +
                    "💰 Cashback: Receive qualifying " +
                    "value back, subject to programme rules.\n\n" +
                    "🏷️ Discounts: Pay less for " +
                    "eligible products or services.\n\n" +
                    "What kind of rewards interest you?",
                links: []
            };
        }

        // Registration information
        if (/\b(join|register|sign up|apply)\b/i.test(text)) {

            return {
                text:
                    "🎁 To join a loyalty programme, " +
                    "visit its official website and " +
                    "follow its registration instructions.\n\n" +
                    "Tell me the programme's name, " +
                    "and I'll help you find its website.",
                links: []
            };
        }

        // Default fallback response
        return {
            text:
                "I'd love to help! 💜\n\n" +
                "I specialise in South African " +
                "loyalty and rewards programmes.\n\n" +
                "Try asking:\n\n" +
                "🎬 What rewards are good for movies?\n" +
                "🍔 I enjoy food and restaurants.\n" +
                "🛒 Which programmes suit grocery shopping?\n" +
                "💰 I only want free programmes.\n\n" +
                "What would you like to explore?",
            links: []
        };
    }

    // =====================================
    // REAL GEMINI CLOUD AI CONNECTION
    // =====================================

    // Our publicly hosted Render backend
    const AI_URL =
        "https://perkpilot-dbht.onrender.com/chat";

    let isSending = false;

    chatbotForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const message = chatbotInput.value.trim();

        if (!message || isSending) return;

        isSending = true;

        // Show customer message
        addMessage(message, "user");

        chatbotInput.value = "";
        chatbotInput.disabled = true;

        const sendButton =
            chatbotForm.querySelector('button[type="submit"]');

        if (sendButton) {
            sendButton.disabled = true;
        }

        // Show AI thinking indicator
        const loadingMessage =
            document.createElement("div");

        loadingMessage.className = "bot-message";

        loadingMessage.textContent =
            "🤖 PerkPilot AI is thinking...";

        chatbotMessages.appendChild(loadingMessage);

        chatbotMessages.scrollTop =
            chatbotMessages.scrollHeight;

        // Allow time for Render to wake up
        const controller = new AbortController();

        const timeoutId = setTimeout(
            () => controller.abort(),
            120000
        );

        try {

            // Send message to cloud FastAPI
            const response = await fetch(AI_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message
                }),

                signal: controller.signal
            });

            if (!response.ok) {

                throw new Error(
                    "AI server returned HTTP " +
                    response.status
                );
            }

            const data = await response.json();

            if (
                typeof data.reply !== "string" ||
                !data.reply.trim()
            ) {
                throw new Error(
                    "AI server returned an empty reply"
                );
            }

            // Display Gemini AI response
            addMessage(
                data.reply,
                "bot"
            );

        } catch (error) {

            console.error(
                "PerkPilot AI connection error:",
                error
            );

            // Fallback if Gemini is unavailable
            const fallback =
                generateResponse(message);

            addMessage(
                "⚠️ Gemini AI is unavailable right now. " +
                "Here's an answer from the built-in " +
                "PerkPilot advisor.\n\n" +
                fallback.text,
                "bot",
                fallback.links
            );

        } finally {

            clearTimeout(timeoutId);

            loadingMessage.remove();

            chatbotInput.disabled = false;

            if (sendButton) {
                sendButton.disabled = false;
            }

            isSending = false;

            if (!chatbotWindow.hidden) {
                chatbotInput.focus();
            }
        }
    });

});
