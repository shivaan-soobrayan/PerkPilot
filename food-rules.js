
/* ==========================================
   PERKPILOT 3.1 — FOOD REWARDS ENGINE
   Last checked: 9 November 2026
   ========================================== */

const PerkPilotFood = (() => {
    "use strict";

    const sources = {
        starbucks:
            "https://www.starbucks.co.za/rewards-terms-conditions",

        spur:
            "https://www.spursteakranches.com/za/faq/family-club"
    };

    function normalise(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    // Identify supported food programmes
    function identifyProgramme(name) {

        const text = normalise(name);

        if (text.includes("starbucks")) {
            return "starbucks";
        }

        if (
            text.includes("spur family") ||
            text.includes("spur steak") ||
            text === "spur"
        ) {
            return "spur";
        }

        return null;
    }

    // Evaluate one wallet account
    function evaluateAccount(account) {

        if (!account || !account.programme) {
            return null;
        }

        const type =
            identifyProgramme(account.programme);

        const balance = Number(account.points);

        if (
            !Number.isFinite(balance) ||
            balance < 0
        ) {
            return null;
        }

        // STARBUCKS — STARS REDEMPTION
        if (type === "starbucks") {

            const required = 250;

            const enough =
                balance >= required;

            const missing =
                Math.max(0, required - balance);

            return {
                programme: account.programme,

                type: "points",

                unit: "Stars",

                enteredBalance: balance,

                rewards: [
                    {
                        name:
                            "Qualifying Starbucks drink or food item",

                        pointsRequired: required,

                        enoughPoints: enough,

                        pointsMissing: missing,

                        possibleRedemptions:
                            Math.floor(balance / required),

                        status: enough
                            ? "Balance meets Stars requirement"
                            : "More Stars needed"
                    }
                ],

                importantNotes: [
                    "The balance is manually entered by the user.",
                    "Qualifying food and drink items are subject to current terms.",
                    "Stars must be available and unexpired.",
                    "Redemption takes place through participating South African Starbucks stores.",
                    "Gold membership status is based on qualifying Stars earned within 12 months, not simply the current wallet balance.",
                    "No automatic redemption or account verification is performed."
                ],

                source: sources.starbucks
            };
        }

        // SPUR — AUTOMATIC VOUCHER REWARDS
        if (type === "spur") {

            return {
                programme: account.programme,

                type: "voucher",

                enteredBalance: balance,

                rewards: [
                    {
                        name: "Spur R50 Meal Voucher",

                        voucherValue: 50,

                        status:
                            "Check whether a voucher has been issued to your Spur account"
                    }
                ],

                importantNotes: [
                    "Spur issues R50 meal vouchers after qualifying accumulated spending.",
                    "An entered points balance does not prove that a voucher has been issued.",
                    "Check the Spur app for available vouchers.",
                    "Voucher redemption is subject to current conditions.",
                    "Spur rewards vouchers cannot be exchanged for cash or tips.",
                    "The bill must meet or exceed the value of vouchers redeemed."
                ],

                source: sources.spur
            };
        }

        // Programme rules not yet supported
        return null;
    }

    // Evaluate all accounts saved in the wallet
    function evaluateWallet(accounts) {

        if (!Array.isArray(accounts)) {
            return [];
        }

        return accounts
            .map(evaluateAccount)
            .filter(Boolean);
    }

    return {
        identifyProgramme,
        evaluateAccount,
        evaluateWallet,
        sources
    };

})();
