
/* ==========================================
   PERKPILOT 2.0 — SMART REWARDS WALLET
   ========================================== */

const WALLET_STORAGE_KEY = "perkpilot_rewards_wallet_v1";

const PerkPilotWallet = {

    // Load saved loyalty programmes
    getAll() {
        try {
            const saved = localStorage.getItem(
                WALLET_STORAGE_KEY
            );

            if (!saved) return [];

            const accounts = JSON.parse(saved);

            return Array.isArray(accounts)
                ? accounts
                : [];

        } catch (error) {
            console.error("Wallet loading error:", error);
            return [];
        }
    },

    // Save the wallet in this browser
    saveAll(accounts) {
        localStorage.setItem(
            WALLET_STORAGE_KEY,
            JSON.stringify(accounts)
        );

        window.dispatchEvent(
            new CustomEvent("perkpilot:wallet-updated", {
                detail: { accounts }
            })
        );
    },

    // Add a loyalty programme
    add(programme, points) {

        const name = String(programme).trim();
        const balance = Number(points);

        if (!name) {
            throw new Error("Enter a loyalty programme.");
        }

        if (
            !Number.isFinite(balance) ||
            balance < 0
        ) {
            throw new Error(
                "Enter a valid points balance."
            );
        }

        const accounts = this.getAll();

        const duplicate = accounts.some(
            account =>
                account.programme.toLowerCase() ===
                name.toLowerCase()
        );

        if (duplicate) {
            throw new Error(
                "This programme is already in your wallet. Edit its balance instead."
            );
        }

        const account = {
            id: crypto.randomUUID(),
            programme: name,
            points: balance,
            updatedAt: new Date().toISOString()
        };

        accounts.push(account);

        this.saveAll(accounts);

        return account;
    },

    // Change a saved points balance
    update(id, newPoints) {

        const balance = Number(newPoints);

        if (
            !Number.isFinite(balance) ||
            balance < 0
        ) {
            throw new Error(
                "Enter a valid points balance."
            );
        }

        const accounts = this.getAll();

        const account = accounts.find(
            item => item.id === id
        );

        if (!account) {
            throw new Error(
                "Loyalty programme not found."
            );
        }

        account.points = balance;
        account.updatedAt =
            new Date().toISOString();

        this.saveAll(accounts);

        return account;
    },

    // Remove a loyalty programme
    remove(id) {

        const accounts = this.getAll();

        const remaining = accounts.filter(
            item => item.id !== id
        );

        this.saveAll(remaining);
    },

    // Search saved programmes by name
    find(programme) {

        const name = String(programme)
            .trim()
            .toLowerCase();

        return this.getAll().find(
            account =>
                account.programme.toLowerCase() === name
        ) || null;
    },

    // Get a simple summary for the AI
    getAISummary() {

        return this.getAll().map(account => ({
            programme: account.programme,
            points: account.points
        }));
    }
};
