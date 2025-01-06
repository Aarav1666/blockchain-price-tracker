# Assignment README

## **Project Overview**
This project provides a blockchain price tracker application with the following features:

- Automatic price saving for Ethereum (ETH) and Polygon (POL).
- Email notifications for significant price changes.
- APIs for fetching hourly prices, setting price alerts, and obtaining swap rates.
- Swagger documentation available for API endpoints.

![Alt text](<Screenshot 2025-01-06 at 10.50.33.png>)

## **Setup Instructions**

### **1. Clone the Repository**
```bash
git clone <repository_url>
cd <project_directory>
```

### **2. Run the Application**
Use Docker to run the application.
```bash
docker compose up -d
```

### **3. Verify Application is Running**
- The application starts on **port 3000**.
- Swagger API documentation is available at: [http://localhost:3000/api](http://localhost:3000/api)

---

## **Feature Details and Testing Instructions**

### **1. Automatic Price Saving**
- **Frequency**: Every 5 minutes.
- **Verification Options**:
  - Check logs for price-saving activities. Logs will show entries such as:
    ```
    [INFO] ETH price saved: $XXXX.XX
    [INFO] POL price saved: $XXXX.XX
    ```
  - Alternatively, query the database to confirm that prices are being saved regularly.

---

### **2. Automatic Email Trigger**
- **Condition**: If the price of ETH or POL increases by more than 3% compared to its price one hour ago.
- **Recipient**: Email sent to `hyperhire_assignment@hyperhire.in`.
- **Verification**:
  - Triggered automatically based on real-time data fetched via Moralis.
  - Observe logs or simulate a price increase of more than 3% to confirm email sending.

---

### **3. Hourly Price API**
- **Endpoint**:
  ```plaintext
  GET /price/hourly?chainSymbol=ETH
  ```
- **Response Example**:
  ```json
  [
    {
      "hour": "2025-01-06T14:00:00Z",
      "averagePrice": 1456.78,
      "minPrice": 1450.00,
      "maxPrice": 1460.50
    }
  ]
  ```

---

### **4. Price Alert API**
- **Functionality**: Set a price alert for a specific chain.
- **Endpoint**:
  ```plaintext
  POST /price/alert
  ```
- **Request Example**:
  ```json
  {
      "chainSymbol": "ETH",
      "targetPrice": 1000,
      "email": "example@test.com"
  }
  ```
- **Verification**: An email is sent when the price of ETH or POL reaches or exceeds the target price.

---

### **5. Swap Rate API**
- **Functionality**: Fetch ETH to BTC swap rate.
- **Endpoint**:
  ```plaintext
  GET /price/swap-eth-to-btc?ethAmount=3591
  ```
- **Response Example**:
  ```json
  {
      "btcAmount": 128.59031111849998,
      "feeInEth": 107.72999999999999,
      "feeInDollar": 395259.01395864127
  }
  ```
- **Details**:
  - BTC amount returned based on the given ETH amount.
  - Fees calculated at 0.03% of the transaction amount, returned in ETH and USD.

---

## **Additional Information**
- **No Authentication Required**: All APIs are publicly accessible.
- **Swagger Documentation**: [http://localhost:3000/api](http://localhost:3000/api)

---

## **Expected Outputs**
- **Logs**: Confirm price-saving activities.
- **Emails**: Validate emails sent for price changes and alerts.
- **API Responses**: Check for correct data in hourly price, alerts, and swap rate endpoints.

---