package com.marziyagold.controller.admin;

import com.marziyagold.dto.InquiryDetailDto;
import com.marziyagold.dto.InquiryStatusUpdateRequest;
import com.marziyagold.dto.InquirySummaryDto;
import com.marziyagold.dto.NewInquiriesCountDto;
import com.marziyagold.entity.InquiryStatus;
import com.marziyagold.service.AdminInquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final AdminInquiryService adminInquiryService;

    @GetMapping
    public ResponseEntity<List<InquirySummaryDto>> getInquiries(
            @RequestParam(required = false) InquiryStatus status,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<InquirySummaryDto> pageResult = adminInquiryService.getInquiries(pageable, status);
        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(pageResult.getTotalElements()))
                .header("X-Total-Pages", String.valueOf(pageResult.getTotalPages()))
                .header("X-Page-Number", String.valueOf(pageResult.getNumber()))
                .header("X-Page-Size", String.valueOf(pageResult.getSize()))
                .body(pageResult.getContent());
    }

    @GetMapping("/new-count")
    public ResponseEntity<NewInquiriesCountDto> getNewInquiriesCount() {
        NewInquiriesCountDto count = adminInquiryService.getNewInquiriesCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InquiryDetailDto> getInquiryById(@PathVariable Long id) {
        InquiryDetailDto inquiry = adminInquiryService.getInquiryById(id);
        return ResponseEntity.ok(inquiry);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<InquiryDetailDto> updateInquiryStatus(
            @PathVariable Long id,
            @Valid @RequestBody InquiryStatusUpdateRequest request,
            Principal principal
    ) {
        String adminUsername = (principal != null) ? principal.getName() : "ADMIN";
        InquiryDetailDto updated = adminInquiryService.updateInquiryStatus(id, request.getStatus(), adminUsername);
        return ResponseEntity.ok(updated);
    }
}
