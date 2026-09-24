package com.marziyagold.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Value("${application.rate-limiting.inquiries.capacity:5}")
    private long capacity;

    @Value("${application.rate-limiting.inquiries.refill-tokens:5}")
    private long refillTokens;

    @Value("${application.rate-limiting.inquiries.refill-duration-minutes:1}")
    private long refillDurationMinutes;

    public Bucket resolveBucket(String clientIp) {
        return cache.computeIfAbsent(clientIp, this::createBucket);
    }

    public boolean tryConsume(String clientIp) {
        Bucket bucket = resolveBucket(clientIp);
        return bucket.tryConsume(1);
    }

    public long getAvailableTokens(String clientIp) {
        Bucket bucket = resolveBucket(clientIp);
        return bucket.getAvailableTokens();
    }

    private Bucket createBucket(String key) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(refillTokens, Duration.ofMinutes(refillDurationMinutes))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
