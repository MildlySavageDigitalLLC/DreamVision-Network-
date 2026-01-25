// DreamVision Network UI Bootstrap
// Handles: Live Market Data, Explorer Tabs, JSON Block Loading

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  loadMarketData();
  loadBlocks();
});

// ------------------------------------------------------------
// 1. TAB SWITCHING LOGIC
// ------------------------------------------------------------
function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".explorer-panel");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");
    });
  });
}

// ------------------------------------------------------------
// 2. LIVE MARKET DATA
// ------------------------------------------------------------

// GeckoTerminal API (DREAM/SOL)
const GECKO_URL =
  "https://api.geckoterminal.com/api/v2/networks/solana/pools/"; 
// You will replace POOL_ID with your actual Raydium pool ID once known
const POOL_ID = "replace_with_pool_id";

// Solana RPC for holder count
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

// Raydium pool data (placeholder)
const RAYDIUM_URL = "https://api.raydium.io/v2/sdk/liquidity/mainnet.json";

async function loadMarketData() {
  loadPrice();
  loadHolders();
  loadRaydium();
}

// ------------------------------------------------------------
// 2A. Load Price + Volume + Market Cap (GeckoTerminal)
// ------------------------------------------------------------
async function loadPrice() {
  const priceEl = document.getElementById("price");
  const volumeEl = document.getElementById("volume");
  const marketcapEl = document.getElementById("marketcap");

  try {
    priceEl.textContent = "Syncing...";
    volumeEl.textContent = "Syncing...";
    marketcapEl.textContent = "Syncing...";

    // Skip if pool ID not set yet
    if (POOL_ID === "replace_with_pool_id") {
      priceEl.textContent = "Awaiting pool ID";
      return;
    }

    const res = await fetch(GECKO_URL + POOL_ID);
    const data = await res.json();

    const pool = data.data.attributes;

    priceEl.textContent = `$${Number(pool.base_token_price_usd).toFixed(6)}`;
    volumeEl.textContent = `$${Number(pool.volume_usd.h24).toLocaleString()}`;
    marketcapEl.textContent = `$${Number(pool.fdv_usd).toLocaleString()}`;
  } catch (err) {
    priceEl.textContent = "Error loading price";
    volumeEl.textContent = "Error";
    marketcapEl.textContent = "Error";
  }
}

// ------------------------------------------------------------
// 2B. Load Holder Count (Solana RPC)
// ------------------------------------------------------------
async function loadHolders() {
  const holdersEl = document.getElementById("holders");

  try {
    holdersEl.textContent = "Syncing...";

    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenLargestAccounts",
      params: ["Hek1Y7UKJRMaqWtfEFJUWb5avKYmYB6E4DqAHhuvKhoZ"]
    };

    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    const accounts = data.result.value.length;
    holdersEl.textContent = accounts + " holders";
  } catch (err) {
    holdersEl.textContent = "Error loading holders";
  }
}

// ------------------------------------------------------------
// 2C. Load Raydium Liquidity (Placeholder)
// ------------------------------------------------------------
async function loadRaydium() {
  // You can expand this later once Raydium pool ID is known
  return;
}

// ------------------------------------------------------------
// 3. JSON BLOCK EXPLORER
// ------------------------------------------------------------

// Loads all JSON files inside /blocks/
async function loadBlocks() {
  const blockList = document.getElementById("block-list");
  const eventList = document.getElementById("event-list");
  const dvtFeed = document.getElementById("dvt-feed");

  blockList.textContent = "Loading blocks...";
  eventList.textContent = "Loading events...";
  dvtFeed.textContent = "Loading DVT feed...";

  try {
    // Fetch directory listing (GitHub Pages doesn't allow listing)
    // So we assume block files are named block-1.json, block-2.json, etc.
    const blocks = [];

    for (let i = 1; i <= 50; i++) {
      const url = `blocks/block-${i}.json`;

      try {
        const res = await fetch(url);
        if (!res.ok) break;

        const json = await res.json();
        blocks.push(json);
      } catch {
        break;
      }
    }

    if (blocks.length === 0) {
      blockList.textContent = "No blocks found. Upload JSON files to /blocks/";
      return;
    }

    // Render Blocks
    blockList.textContent = blocks
      .map(
        b =>
          `Block ${b.BlockID}\nHeight: ${b.Height}\nEvents: ${b.Events.length}\nTime: ${b.Timestamp}\n----------------------`
      )
      .join("\n");

    // Render Events
    const allEvents = blocks.flatMap(b => b.Events);
    eventList.textContent = allEvents
      .map(
        e =>
          `Event ${e.ID}\nType: ${e.Type}\nTime: ${e.Timestamp}\n----------------------`
      )
      .join("\n");

    // Render DVT Feed (Profiles + Posts)
    dvtFeed.textContent = JSON.stringify(blocks[blocks.length - 1].DVT, null, 2);
  } catch (err) {
    blockList.textContent = "Error loading blocks";
    eventList.textContent = "Error loading events";
    dvtFeed.textContent = "Error loading DVT feed";
  }
}
