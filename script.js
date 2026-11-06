
/* ==========================================
   PERKPILOT - LOYALTY RECOMMENDATION ENGINE
   Version 1.0
   ========================================== */

// REAL SOUTH AFRICAN LOYALTY PROGRAMMES
// Benefits are summaries; provider terms may change.

const programmes = [
    {
        name: "Ster-Kinekor SK Club",
        icon: "🎬",
        interests: ["movies"],
        priorities: [
            "discounts", "points",
            "freebies", "experiences"
        ],
        membership: "free",
        description:
            "A cinema loyalty programme for movie lovers.",
        benefits: [
            "Half-price Tuesday movie offers",
            "Earn points towards rewards",
            "Birthday and member benefits"
        ],
        note: "Terms and eligible screenings apply.",
        website:
            "https://www.sterkinekor.com/club-loyalty-sk-club"
    },

    {
        name: "Discovery Vitality",
        icon: "💜",
        interests: [
            "movies", "fitness",
            "travel", "groceries"
        ],
        priorities: [
            "discounts", "cashback",
            "experiences"
        ],
        membership: "paid",
        description:
            "Lifestyle rewards for eligible Vitality members.",
        benefits: [
            "Qualifying cinema ticket discounts",
            "Eligible gym and fitness benefits",
            "Selected travel and healthy food rewards"
        ],
        note:
            "Requires eligible Vitality membership. " +
            "Costs, activation and eligibility rules apply.",
        website:
            "https://www.discovery.co.za/vitality/rewards"
    },

    {
        name: "Starbucks Rewards",
        icon: "☕",
        interests: ["food"],
        priorities: [
            "points", "freebies"
        ],
        membership: "free",
        description:
            "Earn Stars through qualifying Starbucks purchases.",
        benefits: [
            "Collect Stars on eligible purchases",
            "Redeem Stars for eligible rewards",
            "Additional benefits at qualifying levels"
        ],
        note:
            "App, payment and redemption rules apply.",
        website:
            "https://www.starbucks.co.za/rewards"
    },

    {
        name: "Spur Family Club",
        icon: "🍔",
        interests: ["food"],
        priorities: [
            "points", "cashback",
            "freebies"
        ],
        membership: "free",
        description:
            "Restaurant rewards for Spur customers and families.",
        benefits: [
            "Earn rewards on eligible dining",
            "Use accumulated rewards at Spur",
            "Selected family and birthday benefits"
        ],
        note:
            "Check qualifying purchases and reward terms.",
        website:
            "https://www.spursteakranches.com/za/faq/family-club"
    },

    {
        name: "Pick n Pay Smart Shopper",
        icon: "🛒",
        interests: [
            "groceries", "shopping"
        ],
        priorities: [
            "points", "discounts",
            "cashback"
        ],
        membership: "free",
        description:
            "Everyday shopping rewards at Pick n Pay.",
        benefits: [
            "Earn Smart Shopper points",
            "Access qualifying member discounts",
            "Redeem eligible points on purchases"
        ],
        note:
            "Registration and programme conditions apply.",
        website:
            "https://www.pnp.co.za/"
    },

    {
        name: "Clicks ClubCard",
        icon: "💊",
        interests: ["shopping"],
        priorities: [
            "points", "cashback",
            "discounts"
        ],
        membership: "free",
        description:
            "Rewards on eligible health, beauty and retail shopping.",
        benefits: [
            "Earn ClubCard points",
            "Convert qualifying points to cashback",
            "Access selected member offers"
        ],
        note:
            "Minimum points and qualifying periods apply.",
        website:
            "https://clicks.co.za/clubcard"
    },

    {
        name: "Checkers Xtra Savings",
        icon: "🛍️",
        interests: ["groceries"],
        priorities: ["discounts"],
        membership: "free",
        description:
            "A programme focused on eligible shopping discounts.",
        benefits: [
            "Access Xtra Savings offers",
            "Save on selected products",
            "Use your card or linked digital account"
        ],
        note:
            "Offers and eligible products may change.",
        website:
            "https://www.checkers.co.za/registration"
    },

    {
        name: "SAA Voyager",
        icon: "✈️",
        interests: ["travel"],
        priorities: [
            "points", "experiences",
            "freebies"
        ],
        membership: "free",
        description:
            "A frequent flyer programme for qualifying travel.",
        benefits: [
            "Earn miles on eligible flights",
            "Redeem miles for qualifying rewards",
            "Access benefits based on membership tier"
        ],
        note:
            "Earning, tier and redemption conditions apply.",
        website:
            "https://voyager.flysaa.com/programme-overview"
    }
];


/* ==========================================
   MATCHING SYSTEM
   ========================================== */

function calculateMatch(programme, customer) {

    const matchingInterests =
        programme.interests.filter(interest =>
            customer.interests.includes(interest)
        );

    // Only show relevant programme categories.
    if (matchingInterests.length === 0) {
        return null;
    }

    // Respect customers who only want free programmes.
    if (
        customer.membership === "free" &&
        programme.membership === "paid"
    ) {
        return null;
    }

    let score = matchingInterests.length * 10;

    const priorityMatches =
        programme.priorities.includes(customer.priority);

    if (priorityMatches) {
        score += 8;
    }

    if (programme.membership === "free") {
        score += 3;
    }

    // Spending is a soft preference, not an
    // estimate of the customer's actual savings.
    if (
        customer.spending === "low" &&
        programme.membership === "free"
    ) {
        score += 3;
    }

    if (
        ["high", "very-high"].includes(customer.spending) &&
        programme.membership === "paid"
    ) {
        score += 2;
    }

    return {
        ...programme,
        score,
        matchingInterests,
        priorityMatches
    };
}


/* ==========================================
   GENERATE RECOMMENDATIONS
   ========================================== */

function getRecommendations(customer) {

    return programmes
        .map(programme =>
            calculateMatch(programme, customer)
        )
        .filter(result => result !== null)
        .sort((a, b) => b.score - a.score);
}


/* ==========================================
   SHOW RECOMMENDATION CARDS
   ========================================== */

function displayRecommendations(matches) {

    const resultsSection =
        document.getElementById("results");

    const recommendationList =
        document.getElementById("recommendationList");

    recommendationList.innerHTML = "";

    if (matches.length === 0) {

        const message = document.createElement("p");

        message.textContent =
            "No suitable programmes were found. " +
            "Try selecting more interests or " +
            "changing your membership preference.";

        recommendationList.appendChild(message);

    } else {

        matches.forEach((programme, index) => {

            const card = document.createElement("article");
            card.className = "recommendation-card";

            const badge = document.createElement("span");
            badge.className = "match-badge";
            badge.textContent =
                index === 0
                    ? "⭐ TOP RECOMMENDATION"
                    : "✓ SUITABLE MATCH";

            const heading = document.createElement("h3");
            heading.textContent =
                programme.icon + " " + programme.name;

            const description = document.createElement("p");
            description.textContent = programme.description;

            const membership = document.createElement("p");
            membership.textContent =
                programme.membership === "free"
                    ? "✓ Free loyalty membership"
                    : "ℹ Paid or eligible membership required";

            const reason = document.createElement("p");

            const interests =
                programme.matchingInterests.join(", ");

            reason.textContent =
                "Why this matches you: " +
                "You selected " + interests + "." +
                (programme.priorityMatches
                    ? " It also supports your " +
                      "preferred reward type."
                    : "");

            const benefits = document.createElement("ul");

            programme.benefits.forEach(benefit => {

                const item = document.createElement("li");
                item.textContent = benefit;

                benefits.appendChild(item);
            });

            const note = document.createElement("p");
            note.textContent = programme.note;

            const link = document.createElement("a");
            link.href = programme.website;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "View Official Programme →";

            card.append(
                badge,
                heading,
                description,
                membership,
                reason,
                benefits,
                note,
                link
            );

            recommendationList.appendChild(card);
        });
    }

    resultsSection.hidden = false;

    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ==========================================
   CUSTOMER QUESTIONNAIRE
   ========================================== */

const loyaltyForm =
    document.getElementById("loyaltyForm");

loyaltyForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const selectedInterests = Array.from(
        document.querySelectorAll(
            'input[name="interests"]:checked'
        )
    ).map(input => input.value);

    const spending =
        document.getElementById("spending").value;

    const priority =
        document.getElementById("priority").value;

    const membership =
        document.getElementById("membership").value;

    if (selectedInterests.length === 0) {
        alert("Please select at least one interest.");
        return;
    }

    if (!spending || !priority || !membership) {
        alert("Please complete all the questions.");
        return;
    }

    const customer = {
        interests: selectedInterests,
        spending,
        priority,
        membership
    };

    console.log("Customer preferences:", customer);

    const matches = getRecommendations(customer);

    displayRecommendations(matches);
});
