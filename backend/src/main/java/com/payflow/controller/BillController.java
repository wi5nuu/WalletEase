package com.payflow.controller;

import com.payflow.response.BaseResponse;
import com.payflow.dto.response.BillResponse;
import com.payflow.response.SuccessResponse;
import com.payflow.entity.Bill;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.repository.BillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Bill Controller.
 * 
 * Handles bill type queries.
 */
@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillRepository billRepository;

    public BillController(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    @GetMapping
    public ResponseEntity<BaseResponse<List<BillResponse>>> getAllBills() {
        List<Bill> bills = billRepository.findByIsActiveTrue();
        List<BillResponse> responses = bills.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(SuccessResponse.of(responses, "Bills retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<BillResponse>> getBillById(@PathVariable UUID id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        return ResponseEntity.ok(SuccessResponse.of(toResponse(bill), "Bill retrieved successfully"));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<BaseResponse<List<BillResponse>>> getBillsByCategory(
            @PathVariable String category) {
        try {
            Bill.Category cat = Bill.Category.valueOf(category.toUpperCase());
            List<Bill> bills = billRepository.findByCategoryAndIsActiveTrue(cat);
            List<BillResponse> responses = bills.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(SuccessResponse.of(responses, "Bills retrieved successfully"));
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Category", "name", category);
        }
    }

    private BillResponse toResponse(Bill bill) {
        BillResponse response = new BillResponse();
        response.setId(bill.getId());
        response.setName(bill.getName());
        response.setCategory(bill.getCategory().name());
        response.setIconCode(bill.getIconCode());
        response.setFixedAmount(bill.getFixedAmount());
        response.setIsVariableAmount(bill.isVariableAmount());
        response.setIsActive(bill.getIsActive());
        return response;
    }
}
