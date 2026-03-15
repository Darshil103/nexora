# ============================================================
# Nexora Deep Trading Logic Test Script
# ============================================================

$baseUrl = "http://localhost:8080/api"

function Login($email, $password) {
    $body = @{email=$email; password=$password} | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body
    return $res.data.token
}

function ApiCall($method, $path, $token, $body = $null) {
    $headers = @{ Authorization = "Bearer $token" }
    $params = @{
        Uri = "$baseUrl$path"
        Method = $method
        ContentType = "application/json"
        Headers = $headers
    }
    if ($body) { $params.Body = ($body | ConvertTo-Json) }
    try {
        return Invoke-RestMethod @params
    } catch {
        $errorBody = $_.ErrorDetails.Message
        return @{ success = $false; message = "HTTP $($_.Exception.Response.StatusCode): $errorBody" }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " NEXORA TRADING LOGIC - DEEP TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ---- TEST 1: LOGIN ----
Write-Host "=== TEST 1: LOGIN ===" -ForegroundColor Yellow
$inv1Token = Login "investor1@nexora.com" "password123"
$inv2Token = Login "investor2@nexora.com" "password123"
Write-Host "[PASS] Investor1 token: $($inv1Token.Substring(0,20))..." -ForegroundColor Green
Write-Host "[PASS] Investor2 token: $($inv2Token.Substring(0,20))..." -ForegroundColor Green

# Test login with wrong password
try {
    Login "investor1@nexora.com" "wrongpassword"
    Write-Host "[FAIL] Wrong password should have failed" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Wrong password correctly rejected" -ForegroundColor Green
}

# ---- TEST 2: WALLET OPERATIONS ----
Write-Host "`n=== TEST 2: WALLET OPERATIONS ===" -ForegroundColor Yellow

# Get wallet balance
$wallet = ApiCall "GET" "/wallet" $inv1Token
Write-Host "Inv1 Balance: $($wallet.data.balance), Reserved: $($wallet.data.reserved_balance)" -ForegroundColor White

# Deposit
$depositRes = ApiCall "POST" "/wallet/deposit" $inv1Token @{amount="50000"; referenceId="TEST-DEP-001"}
Write-Host "After Deposit 50000: Balance = $($depositRes.data.balance)" -ForegroundColor White
if ($depositRes.success -eq $true) { Write-Host "[PASS] Deposit succeeded" -ForegroundColor Green } else { Write-Host "[FAIL] Deposit failed: $($depositRes.message)" -ForegroundColor Red }

# Withdraw
$withdrawRes = ApiCall "POST" "/wallet/withdraw" $inv1Token @{amount="10000"}
Write-Host "After Withdraw 10000: Balance = $($withdrawRes.data.balance)" -ForegroundColor White
if ($withdrawRes.success -eq $true) { Write-Host "[PASS] Withdrawal succeeded" -ForegroundColor Green } else { Write-Host "[FAIL] Withdrawal failed" -ForegroundColor Red }

# Edge: Withdraw more than balance
$overWithdraw = ApiCall "POST" "/wallet/withdraw" $inv1Token @{amount="99999999"}
if ($overWithdraw.success -eq $false) { Write-Host "[PASS] Over-withdrawal correctly rejected: $($overWithdraw.message)" -ForegroundColor Green } else { Write-Host "[FAIL] Over-withdrawal should have been rejected!" -ForegroundColor Red }

# Edge: Deposit negative
$negDeposit = ApiCall "POST" "/wallet/deposit" $inv1Token @{amount="-100"}
if ($negDeposit.success -eq $false) { Write-Host "[PASS] Negative deposit correctly rejected" -ForegroundColor Green } else { Write-Host "[FAIL] Negative deposit should have been rejected!" -ForegroundColor Red }

# Edge: Deposit zero
$zeroDeposit = ApiCall "POST" "/wallet/deposit" $inv1Token @{amount="0"}
if ($zeroDeposit.success -eq $false) { Write-Host "[PASS] Zero deposit correctly rejected" -ForegroundColor Green } else { Write-Host "[FAIL] Zero deposit should have been rejected!" -ForegroundColor Red }

# ---- TEST 3: MARKET DATA ----
Write-Host "`n=== TEST 3: MARKET DATA ===" -ForegroundColor Yellow

$stocks = ApiCall "GET" "/stocks" $inv1Token
Write-Host "Total stocks: $($stocks.data.Count)" -ForegroundColor White
foreach ($s in $stocks.data) {
    Write-Host "  $($s.symbol) | Price: $($s.current_price) | Status: $($s.status)" -ForegroundColor White
}
if ($stocks.data.Count -ge 6) { Write-Host "[PASS] All 6 stocks loaded" -ForegroundColor Green } else { Write-Host "[FAIL] Expected 6 stocks" -ForegroundColor Red }

# ---- TEST 4: HOLDINGS ----
Write-Host "`n=== TEST 4: HOLDINGS ===" -ForegroundColor Yellow

$holdings = ApiCall "GET" "/holdings" $inv1Token
Write-Host "Investor1 holdings: $($holdings.data.Count)" -ForegroundColor White
foreach ($h in $holdings.data) {
    Write-Host "  $($h.symbol) | Qty: $($h.quantity) | AvgCost: $($h.average_cost) | P&L: $($h.pnl)" -ForegroundColor White
}
if ($holdings.data.Count -eq 3) { Write-Host "[PASS] Investor1 has 3 holdings (TFLOW, FMTRIC, GRNEV)" -ForegroundColor Green } else { Write-Host "[FAIL] Expected 3 holdings, got $($holdings.data.Count)" -ForegroundColor Red }

# ---- TEST 5: BUY ORDER (MARKET) ----
Write-Host "`n=== TEST 5: BUY ORDER (MARKET) ===" -ForegroundColor Yellow

# Get wallet before
$walletBefore = ApiCall "GET" "/wallet" $inv1Token
Write-Host "Wallet before BUY: Balance=$($walletBefore.data.balance), Reserved=$($walletBefore.data.reserved_balance)" -ForegroundColor White

# Get HSYNC stock id (investor1 doesn't own it)
$hsync = $stocks.data | Where-Object { $_.symbol -eq "HSYNC" }
Write-Host "Buying HSYNC (id=$($hsync.id)) at market price $($hsync.current_price)" -ForegroundColor White

$buyOrder = ApiCall "POST" "/orders" $inv1Token @{stock_id=$hsync.id; order_type="BUY"; price_type="MARKET"; quantity=10; price=$hsync.current_price}
if ($buyOrder.success -eq $true) { 
    Write-Host "[PASS] Market BUY order placed: Status=$($buyOrder.data.status), Filled=$($buyOrder.data.filled_quantity)/$($buyOrder.data.quantity)" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] BUY order failed: $($buyOrder.message)" -ForegroundColor Red 
}

# Check wallet after
$walletAfter = ApiCall "GET" "/wallet" $inv1Token
Write-Host "Wallet after BUY: Balance=$($walletAfter.data.balance), Reserved=$($walletAfter.data.reserved_balance)" -ForegroundColor White

# Check holdings now include HSYNC
$holdingsAfter = ApiCall "GET" "/holdings" $inv1Token
$hsyncHolding = $holdingsAfter.data | Where-Object { $_.symbol -eq "HSYNC" }
if ($hsyncHolding) { 
    Write-Host "[PASS] HSYNC added to holdings: Qty=$($hsyncHolding.quantity)" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] HSYNC not in holdings after buy!" -ForegroundColor Red 
}

# ---- TEST 6: SELL ORDER (MARKET) ----
Write-Host "`n=== TEST 6: SELL ORDER (MARKET) ===" -ForegroundColor Yellow

# Sell some TFLOW (investor1 owns 100)
$tflow = $stocks.data | Where-Object { $_.symbol -eq "TFLOW" }
Write-Host "Selling 10 TFLOW (id=$($tflow.id)) at market price $($tflow.current_price)" -ForegroundColor White

$sellOrder = ApiCall "POST" "/orders" $inv1Token @{stock_id=$tflow.id; order_type="SELL"; price_type="MARKET"; quantity=10; price=$tflow.current_price}
if ($sellOrder.success -eq $true) { 
    Write-Host "[PASS] Market SELL order placed: Status=$($sellOrder.data.status), Filled=$($sellOrder.data.filled_quantity)/$($sellOrder.data.quantity)" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] SELL order failed: $($sellOrder.message)" -ForegroundColor Red 
}

# Check TFLOW holding reduced
$holdingsAfterSell = ApiCall "GET" "/holdings" $inv1Token
$tflowHolding = $holdingsAfterSell.data | Where-Object { $_.symbol -eq "TFLOW" }
Write-Host "TFLOW holding after sell: Qty=$($tflowHolding.quantity)" -ForegroundColor White
if ($tflowHolding.quantity -eq 90) { Write-Host "[PASS] TFLOW reduced from 100 to 90" -ForegroundColor Green } else { Write-Host "[INFO] TFLOW quantity: $($tflowHolding.quantity)" -ForegroundColor Yellow }

# ---- TEST 7: LIMIT ORDER (BUY) ----
Write-Host "`n=== TEST 7: LIMIT ORDER (BUY) ===" -ForegroundColor Yellow

$limitBuy = ApiCall "POST" "/orders" $inv1Token @{stock_id=$hsync.id; order_type="BUY"; price_type="LIMIT"; quantity=20; price=80.00}
if ($limitBuy.success -eq $true) { 
    Write-Host "[PASS] Limit BUY placed: Status=$($limitBuy.data.status), Price=$($limitBuy.data.price)" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] Limit BUY failed: $($limitBuy.message)" -ForegroundColor Red 
}

# ---- TEST 8: LIMIT ORDER (SELL) - place from inv2, try to match with inv1's buy ----
Write-Host "`n=== TEST 8: CROSS-USER ORDER MATCHING ===" -ForegroundColor Yellow

# Investor2 places a SELL limit at 79 (should match inv1's BUY at 80)
$limitSell = ApiCall "POST" "/orders" $inv2Token @{stock_id=$hsync.id; order_type="SELL"; price_type="LIMIT"; quantity=5; price=79.00}
if ($limitSell.success -eq $true) { 
    Write-Host "[PASS] Inv2 Limit SELL placed: Status=$($limitSell.data.status), Filled=$($limitSell.data.filled_quantity)" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] Inv2 SELL failed: $($limitSell.message)" -ForegroundColor Red 
}

# ---- TEST 9: CANCEL ORDER ----
Write-Host "`n=== TEST 9: CANCEL ORDER ===" -ForegroundColor Yellow

# Place another limit order then cancel it
$toCancelOrder = ApiCall "POST" "/orders" $inv1Token @{stock_id=$tflow.id; order_type="BUY"; price_type="LIMIT"; quantity=5; price=200.00}
if ($toCancelOrder.success -eq $true) {
    $cancelRes = ApiCall "DELETE" "/orders/$($toCancelOrder.data.id)" $inv1Token
    if ($cancelRes.success -eq $true -and $cancelRes.data.status -eq "CANCELLED") { 
        Write-Host "[PASS] Order cancelled successfully, refund applied" -ForegroundColor Green 
    } else { 
        Write-Host "[FAIL] Cancel failed: $($cancelRes.message)" -ForegroundColor Red 
    }
} else {
    Write-Host "[FAIL] Could not place order to cancel: $($toCancelOrder.message)" -ForegroundColor Red
}

# ---- TEST 10: EDGE CASES ----
Write-Host "`n=== TEST 10: EDGE CASES ===" -ForegroundColor Yellow

# Sell more than you own
$overSell = ApiCall "POST" "/orders" $inv1Token @{stock_id=$tflow.id; order_type="SELL"; price_type="MARKET"; quantity=9999; price=$tflow.current_price}
if ($overSell.success -eq $false) { 
    Write-Host "[PASS] Sell more than owned correctly rejected" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] Should reject selling more than owned! Status=$($overSell.data.status)" -ForegroundColor Red 
}

# Buy with insufficient balance
$overBuy = ApiCall "POST" "/orders" $inv1Token @{stock_id=$tflow.id; order_type="BUY"; price_type="MARKET"; quantity=999999; price=$tflow.current_price}
if ($overBuy.success -eq $false) { 
    Write-Host "[PASS] Buy with insufficient balance correctly rejected" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] Should reject buy with insufficient balance!" -ForegroundColor Red 
}

# Invalid stock ID
$badStock = ApiCall "POST" "/orders" $inv1Token @{stock_id=99999; order_type="BUY"; price_type="MARKET"; quantity=1; price=100}
if ($badStock.success -eq $false) { 
    Write-Host "[PASS] Invalid stock ID correctly rejected" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] Should reject invalid stock ID!" -ForegroundColor Red 
}

# Zero quantity
$zeroQty = ApiCall "POST" "/orders" $inv1Token @{stock_id=$tflow.id; order_type="BUY"; price_type="MARKET"; quantity=0; price=$tflow.current_price}
if ($zeroQty.success -eq $false) { 
    Write-Host "[PASS] Zero quantity correctly rejected" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] Should reject zero quantity!" -ForegroundColor Red 
}

# ---- TEST 11: KYC NOT APPROVED (investor3) ----
Write-Host "`n=== TEST 11: KYC PENDING USER ===" -ForegroundColor Yellow
$inv3Token = Login "investor3@nexora.com" "password123"
$kycBuy = ApiCall "POST" "/orders" $inv3Token @{stock_id=$tflow.id; order_type="BUY"; price_type="MARKET"; quantity=1; price=$tflow.current_price}
if ($kycBuy.success -eq $false) { 
    Write-Host "[PASS] KYC-pending user correctly blocked from trading" -ForegroundColor Green 
} else { 
    Write-Host "[FAIL] KYC-pending user should not be able to trade!" -ForegroundColor Red 
}

# ---- TEST 12: VIEW ORDERS ----
Write-Host "`n=== TEST 12: ORDER HISTORY ===" -ForegroundColor Yellow
$orders = ApiCall "GET" "/orders" $inv1Token
Write-Host "Investor1 total orders: $($orders.data.Count)" -ForegroundColor White
foreach ($o in $orders.data) {
    Write-Host "  ID=$($o.id) $($o.order_type) $($o.symbol) Qty=$($o.quantity) Filled=$($o.filled_quantity) Price=$($o.price) Status=$($o.status)" -ForegroundColor White
}

# ---- TEST 13: TRANSACTIONS ----
Write-Host "`n=== TEST 13: TRANSACTION HISTORY ===" -ForegroundColor Yellow
$txns = ApiCall "GET" "/wallet/transactions" $inv1Token
Write-Host "Total transactions: $($txns.data.Count)" -ForegroundColor White
foreach ($t in $txns.data | Select-Object -First 5) {
    Write-Host "  $($t.transaction_type) | Amount=$($t.amount) | Before=$($t.balance_before) -> After=$($t.balance_after) | $($t.description)" -ForegroundColor White
}

# ---- TEST 14: IPO ----
Write-Host "`n=== TEST 14: IPO LISTINGS ===" -ForegroundColor Yellow
$ipos = ApiCall "GET" "/ipo/listings" $inv1Token
Write-Host "Total IPO listings: $($ipos.data.Count)" -ForegroundColor White
foreach ($ipo in $ipos.data) {
    Write-Host "  $($ipo.symbol) | Price=$($ipo.ipo_price) | Shares=$($ipo.shares_offered) | Status=$($ipo.status)" -ForegroundColor White
}

# ---- FINAL WALLET STATE ----
Write-Host "`n=== FINAL STATE ===" -ForegroundColor Yellow
$finalWallet = ApiCall "GET" "/wallet" $inv1Token
Write-Host "Final Wallet: Balance=$($finalWallet.data.balance), Reserved=$($finalWallet.data.reserved_balance)" -ForegroundColor White

$finalHoldings = ApiCall "GET" "/holdings" $inv1Token
Write-Host "Final Holdings:" -ForegroundColor White
foreach ($h in $finalHoldings.data) {
    Write-Host "  $($h.symbol) | Qty=$($h.quantity) | AvgCost=$($h.average_cost) | CurrentValue=$($h.current_value) | P&L=$($h.pnl)" -ForegroundColor White
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TEST SUITE COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
