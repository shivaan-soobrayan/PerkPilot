
/* =========================================
   PERKPILOT 3.0 — CINEMA REWARDS DISPLAY
   ========================================= */

(() => {
    "use strict";

    const goalForm =
        document.getElementById("walletGoalForm");

    const suggestions =
        document.getElementById("walletSuggestions");

    if (
        !goalForm ||
        !suggestions ||
        typeof PerkPilotWallet === "undefined" ||
        typeof PerkPilotCinema === "undefined"
    ) {
        console.warn("Cinema rewards interface unavailable.");
        return;
    }

    // Add styling without replacing style.css
    const style = document.createElement("style");

    style.textContent = `
        .cinema-breakdown {
            margin-top: 25px;
            padding: 22px;
            border-radius: 18px;
            border: 1px solid #a78bfa80;
            background: #17132c;
            color: #f5f2ff;
        }

        .cinema-breakdown h3 {
            color: #ffffff;
            font-size: 22px;
            margin-bottom: 12px;
        }

        .cinema-programme {
            margin-top: 20px;
            padding-top: 18px;
            border-top: 1px solid #ffffff30;
        }

        .cinema-programme h4 {
            font-size: 17px;
            color: #d4c4ff;
            margin-bottom: 8px;
        }

        .cinema-programme p {
            color: #c9c4dc;
            font-size: 13px;
            line-height: 1.7;
        }

        .cinema-reward {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            margin-top: 10px;
            padding: 14px;
            background: #ffffff0d;
            border: 1px solid #ffffff26;
            border-radius: 12px;
        }

        .cinema-reward-name {
            font-size: 13px;
            font-weight: 700;
            color: #fff;
        }

        .cinema-reward-points {
            font-size: 12px;
            color: #c5bfda;
            margin-top: 4px;
        }

        .cinema-status {
            font-size: 12px;
            font-weight: 700;
            text-align: right;
            flex-shrink: 0;
        }

        .cinema-status.enough {
            color: #8bf0bb;
        }

        .cinema-status.short {
            color: #ffb7c5;
        }

        .cinema-notes {
            color: #c5bfd9;
            font-size: 12px;
            line-height: 1.75;
            margin-top: 18px;
        }

        .cinema-source {
            display: inline-block;
            color: #c8b5ff;
            text-decoration: underline;
            margin-top: 12px;
            font-size: 13px;
        }

        @media (max-width: 480px) {
            .cinema-breakdown {
                padding: 16px;
            }

            .cinema-reward {
                align-items: flex-start;
                flex-direction: column;
            }

            .cinema-status {
                text-align: left;
            }
        }
    `;

    document.head.appendChild(style);

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function formatPoints(value) {
        return Number(value).toLocaleString("en-ZA", {
            maximumFractionDigits: 2
        });
    }

    function displayCinemaRewards() {

        // Remove previous breakdown
        document.getElementById(
            "cinemaBreakdown"
        )?.remove();

        const goal =
            document.getElementById("walletGoal").value;

        // Only display cinema details for
        // movies or all possible uses
        if (goal !== "movies" && goal !== "anything") {
            return;
        }

        const accounts = PerkPilotWallet.getAll();

        const evaluations =
            PerkPilotCinema.evaluateWallet(accounts);

        if (!evaluations.length) {
            return;
        }

        const panel = createElement(
            "section",
            "cinema-breakdown"
        );

        panel.id = "cinemaBreakdown";

        panel.appendChild(
            createElement(
                "h3",
                "",
                "🎬 Your Cinema Rewards Breakdown"
            )
        );

        panel.appendChild(
            createElement(
                "p",
                "cinema-notes",
                "These calculations use your manually entered balances and the redemption rules saved in PerkPilot. Confirm the current rules and your eligibility with each provider."
            )
        );

        evaluations.forEach(result => {

            const programme = createElement(
                "div",
                "cinema-programme"
            );

            programme.appendChild(
                createElement(
                    "h4",
                    "",
                    result.programme
                )
            );

            // SK CLUB POINTS REDEMPTIONS
            if (result.type === "points") {

                programme.appendChild(
                    createElement(
                        "p",
                        "",
                        `Your entered balance: ${formatPoints(result.enteredBalance)} points`
                    )
                );

                result.rewards.forEach(reward => {

                    const card = createElement(
                        "div",
                        "cinema-reward"
                    );

                    const details = createElement(
                        "div"
                    );

                    details.appendChild(
                        createElement(
                            "div",
                            "cinema-reward-name",
                            reward.name
                        )
                    );

                    details.appendChild(
                        createElement(
                            "div",
                            "cinema-reward-points",
                            `Requires ${formatPoints(reward.pointsRequired)} points`
                        )
                    );

                    card.appendChild(details);

                    const status = createElement(
                        "span",
                        reward.enoughPoints
                            ? "cinema-status enough"
                            : "cinema-status short",
                        reward.enoughPoints
                            ? "✓ Enough points"
                            : `${formatPoints(reward.pointsMissing)} points short`
                    );

                    card.appendChild(status);

                    programme.appendChild(card);

                });
            }

            // DISCOVERY VITALITY MEMBERSHIP BENEFITS
            if (result.type === "membership-discount") {

                programme.appendChild(
                    createElement(
                        "p",
                        "",
                        "These are potential membership-based discounts, NOT redemptions calculated from your entered points balance."
                    )
                );

                result.rewards.forEach(reward => {

                    const card = createElement(
                        "div",
                        "cinema-reward"
                    );

                    card.appendChild(
                        createElement(
                            "div",
                            "cinema-reward-name",
                            reward.name
                        )
                    );

                    card.appendChild(
                        createElement(
                            "span",
                            "cinema-status enough",
                            `${reward.discountPercent}% listed benefit*`
                        )
                    );

                    programme.appendChild(card);
                });

                programme.appendChild(
                    createElement(
                        "p",
                        "cinema-notes",
                        "*Subject to qualifying Vitality membership, activation, participating cinemas and current terms."
                    )
                );
            }

            // Important conditions
            if (Array.isArray(result.importantNotes)) {

                const notes = createElement(
                    "p",
                    "cinema-notes",
                    result.importantNotes.join(" • ")
                );

                programme.appendChild(notes);
            }

            // Provider rules link
            if (
                typeof result.source === "string" &&
                result.source.startsWith("https://")
            ) {
                const link = createElement(
                    "a",
                    "cinema-source",
                    "Check provider redemption terms ↗"
                );

                link.href = result.source;
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                programme.appendChild(link);
            }

            panel.appendChild(programme);
        });

        suggestions.hidden = false;
        suggestions.appendChild(panel);
    }

    // Run after the existing wallet recommendation handler
    goalForm.addEventListener(
        "submit",
        displayCinemaRewards
    );

})();
