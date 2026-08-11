package com.canteen.features.branch;

import com.canteen.features.branch.dto.BranchRequest;
import com.canteen.features.branch.dto.BranchResponse;
import com.canteen.features.branch.mapper.BranchMapper;
import com.canteen.model.Branch;
import com.canteen.repository.BranchRepository;
import com.canteen.utils.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final BranchMapper branchMapper;

    @Transactional
    public BranchResponse create(BranchRequest request) {
        Branch branch = branchMapper.toEntity(request);
        Branch saved = branchRepository.save(branch);
        return branchMapper.toDTO(saved);
    }

    @Transactional
    public BranchResponse update(Integer id, BranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + id));
        branchMapper.updateEntity(request, branch);
        Branch saved = branchRepository.save(branch);
        return branchMapper.toDTO(saved);
    }

    public List<BranchResponse> getAll() {
        return branchRepository.findAll()
                .stream()
                .filter(b -> b.getDeleteFlag() == null || !b.getDeleteFlag())
                .map(branchMapper::toDTO)
                .collect(Collectors.toList());
    }

    public BranchResponse getById(Integer id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + id));
        return branchMapper.toDTO(branch);
    }

    @Transactional
    public void delete(Integer id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + id));
        branch.setDeleteFlag(true);
        branchRepository.save(branch);
    }
}
