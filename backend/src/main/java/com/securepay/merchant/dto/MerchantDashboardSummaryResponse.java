package com.securepay.merchant.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record MerchantDashboardSummaryResponse(
        String currency,
        BigDecimal totalRevenue,
        int successfulPayments,
        int pendingPayments,
        BigDecimal refunds,
        List<Map<String, Object>> recentPayments
) {}
