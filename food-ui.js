
/* ==========================================
   PERKPILOT 3.1 — FOOD REWARDS INTERFACE
   ========================================== */

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
        typeof PerkPilotFood === "undefined"
    ) {
        console.warn("Food rewards interface unavailable.");
        return;
    }

    // FOOD REWARDS STYLING
    const style = document.createElement("style");

    style.textContent = `
        .food-breakdown {
            margin-top: 25px;
            padding: 22px;
            border-radius: 18px;
            border: 1px solid #f4b96b80;
            background: #201728;
            color: #fff;
        }

        .food-breakdown h3 {
            color: white;
            font-size: 22px;
            margin-bottom: 12px;
        }

        .food-programme {
            border-top: 1px solid #ffffff30;
            margin-top: 18px;
            padding-top: 18px;
        }

        .food-programme h4 {
            color: #ffd69c;
            font-size: 18px;
            margin-bottom: 10px;
        }

        .food-reward {
            background: #ffffff0c;
            border: 1px solid #ffffff25;
            border-radius: 12px;
            padding: 16px;
            margin-top: 12px;
        }

        .food-reward-name {
            color: #fff;
            font-size: 14px;
            font-weight: 700;
        }

        .food-reward-info {
            color: #d9d0df;
            font-size: 13px;
            line-height: 1.7;
            margin-top: 7px;
        }

        .food-status {
            display: inline-block;
            margin-top: 10px;
            font-size: 13px;
            font-weight: 700;
        }

        .food-status.enough {
            color: #90f1b9;
        }

        .food-status.short {
            color: #ffb4c1;
        }

        .food-status.check {
            color: #ffdb91;
        }

        .food-notes {
            margin-top: 14px;
            color: #cbc3d1;
            font-size: 12px;
            line-height: 1.8;
        }

        .food-source {
            display: inline-block;
            margin-top: 14px;
            color: #ffda9d;
            text-decoration: underline;
            font-size: 13px;
        }
    `;

    document.head.appendChild(style);

    function make(tag, className, content) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (content !== undefined) {
            element.textContent = content;
        }

        return element;
    }

    function format(value) {
        return Number(value).toLocaleString("en-ZA", {
            maximumFractionDigits: 2
        });
    }

    function displayFoodRewards() {

        // Clear previous food calculations
        document.getElementById(
            "foodBreakdown"
        )?.remove();

        const goal =
            document.getElementById("walletGoal").value;

        if (goal !== "food" && goal !== "anything") {
            return;
        }

        const accounts = PerkPilotWallet.getAll();

        const results =
            PerkPilotFood.evaluateWallet(accounts);

        if (!results.length) {
            return;
        }

        const panel = make(
            "section",
            "food-breakdown"
        );

        panel.id = "foodBreakdown";

        panel.appendChild(
            make(
                "h3",
                "",
                "🍔 Your Food & Dining Rewards"
            )
        );

        panel.appendChild(
            make(
                "p",
                "food-notes",
                "Results are based on manually entered balances and the programme rules stored in PerkPilot. Actual availability and eligibility must be confirmed with the provider."
            )
        );

        results.forEach(result => {

            const programme = make(
                "div",
                "food-programme"
            );

            programme.appendChild(
                make("h4", "", result.programme)
            );

            // STARBUCKS STARS
            if (result.type === "points") {

                programme.appendChild(
                    make(
                        "p",
                        "food-reward-info",
                        `Your entered balance: ${format(result.enteredBalance)} ${result.unit || "points"}`
                    )
                );

                result.rewards.forEach(reward => {

                    const card = make(
                        "div",
                        "food-reward"
                    );

                    card.appendChild(
                        make(
                            "div",
                            "food-reward-name",
                            reward.name
                        )
                    );

                    card.appendChild(
                        make(
                            "p",
                            "food-reward-info",
                            `Requires ${format(reward.pointsRequired)} ${result.unit || "points"} per qualifying redemption.`
                        )
                    );

                    if (reward.enoughPoints) {

                        card.appendChild(
                            make(
                                "span",
                                "food-status enough",
                                "✓ Entered balance meets requirement"
                            )
                        );

                        card.appendChild(
                            make(
                                "p",
                                "food-reward-info",
                                `Potential redemptions: ${format(reward.possibleRedemptions)}`
                            )
                        );

                    } else {

                        card.appendChild(
                            make(
                                "span",
                                "food-status short",
                                `${format(reward.pointsMissing)} more ${result.unit || "points"} needed`
                            )
                        );
                    }

                    programme.appendChild(card);
                });
            }

            // SPUR FAMILY CLUB VOUCHERS
            if (result.type === "voucher") {

                programme.appendChild(
                    make(
                        "p",
                        "food-reward-info",
                        "This programme uses issued reward vouchers. An entered points balance cannot confirm voucher availability."
                    )
                );

                result.rewards.forEach(reward => {

                    const card = make(
                        "div",
                        "food-reward"
                    );

                    card.appendChild(
                        make(
                            "div",
                            "food-reward-name",
                            reward.name
                        )
                    );

                    card.appendChild(
                        make(
                            "p",
                            "food-reward-info",
                            reward.status
                        )
                    );

                    card.appendChild(
                        make(
                            "span",
                            "food-status check",
                            "Check your official Spur account"
                        )
                    );

                    programme.appendChild(card);
                });
            }

            // REDEMPTION CONDITIONS
            if (Array.isArray(result.importantNotes)) {

                programme.appendChild(
                    make(
                        "p",
                        "food-notes",
                        result.importantNotes.join(" • ")
                    )
                );
            }

            // OFFICIAL PROGRAMME TERMS
            if (
                typeof result.source === "string" &&
                result.source.startsWith("https://")
            ) {

                const link = make(
                    "a",
                    "food-source",
                    "Check provider reward terms ↗"
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

    // Runs after the existing wallet results
    // without replacing cinema calculations.
    goalForm.addEventListener(
        "submit",
        displayFoodRewards
    );

})();
