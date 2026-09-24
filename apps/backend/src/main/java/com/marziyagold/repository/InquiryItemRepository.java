package com.marziyagold.repository;

import com.marziyagold.entity.InquiryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryItemRepository extends JpaRepository<InquiryItem, Long> {

    List<InquiryItem> findByInquiryId(Long inquiryId);
}
