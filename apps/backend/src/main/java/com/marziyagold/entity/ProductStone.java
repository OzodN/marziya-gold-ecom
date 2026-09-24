package com.marziyagold.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "product_stone")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stone_type_id", nullable = false)
    private StoneType stoneType;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "characteristics", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<Map<String, Object>> characteristics = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (characteristics == null) {
            characteristics = new ArrayList<>();
        }
    }
}
