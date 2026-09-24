package com.marziyagold.repository;

import com.marziyagold.entity.InquiryStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryStatusHistoryRepository extends JpaRepository<InquiryStatusHistory, Long> {

    List<InquiryStatusHistory> findByInquiryIdOrderByChangedAtAsc(Long inquiryId);
}
