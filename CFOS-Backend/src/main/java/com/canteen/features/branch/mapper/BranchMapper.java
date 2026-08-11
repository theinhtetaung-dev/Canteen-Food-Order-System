package com.canteen.features.branch.mapper;

import com.canteen.features.branch.dto.BranchRequest;
import com.canteen.features.branch.dto.BranchResponse;
import com.canteen.model.Branch;
import org.springframework.stereotype.Component;

@Component
public class BranchMapper {
    public Branch toEntity(BranchRequest request) {
        if (request == null) return null;
        Branch branch = new Branch();
        branch.setBranchName(request.getBranchName());
        branch.setLocation(request.getLocation());
        return branch;
    }

    public BranchResponse toDTO(Branch branch) {
        if (branch == null) return null;
        BranchResponse response = new BranchResponse();
        response.setBranchId(branch.getBranchId());
        response.setBranchName(branch.getBranchName());
        response.setLocation(branch.getLocation());
        response.setCreatedAt(branch.getCreatedAt());
        response.setUpdatedAt(branch.getUpdatedAt());
        return response;
    }

    public void updateEntity(BranchRequest request, Branch branch) {
        if (request == null || branch == null) return;
        branch.setBranchName(request.getBranchName());
        branch.setLocation(request.getLocation());
    }
}
