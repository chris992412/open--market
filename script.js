
// Get form and referral code from the URL
const form = document.getElementById("registration-form");
const urlParams = new URLSearchParams(window.location.search);
const referrer = urlParams.get("ref");

// Show referral banner if referred
if (referrer) {
  const banner = document.createElement("p");
  banner.innerText = `👋 You were referred by @${referrer}`;
  banner.style.fontWeight = "bold";
  banner.style.color = "#2e8b57";
  document.getElementById("register").prepend(banner);
}

// Paystack payment handler
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const fullName = form.elements[0].value.trim();
  const email = form.elements[1].value.trim();

  if (!fullName || !email) {
    alert("Please enter your full name and email.");
    return;
  }

  const handler = PaystackPop.setup({
    key: 'pk_test_26a6605ee824461ddf34e76ce246a66af16f8ec0',
    email: email,
    amount: 10000, // ₵100 in Kobo
    currency: "GHS",
    ref: 'REG-' + Math.floor(Math.random() * 1000000000),
    metadata: {
      custom_fields: [
        {
          display_name: "Full Name",
          variable_name: "full_name",
          value: fullName
        },
        {
          display_name: "Referrer",
          variable_name: "referrer",
          value: referrer || "none"
        }
      ]
    },
    callback: function (response) {
      alert("✅ Payment successful! Ref: " + response.reference);

      // Send data to Google Sheet
      fetch("https://script.google.com/macros/s/AKfycbxGS4MIQxOukvDNqcz1rGoAG_WYl13kd5cRCcHlaeSCL14e2FOd0m11ytrSJvSJW_Ynnw/exec", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName,
          email: email,
          referrer: referrer || "none",
          reference: response.reference
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(res => res.text())
      .then(data => {
        console.log("Saved to Google Sheet:", data);
      })
      .catch(err => {
        console.error("Error saving to Sheet:", err);
      });
    },

    onClose: function () {
      alert("❌ Payment window closed.");
    }
  });

  handler.openIframe();
});
