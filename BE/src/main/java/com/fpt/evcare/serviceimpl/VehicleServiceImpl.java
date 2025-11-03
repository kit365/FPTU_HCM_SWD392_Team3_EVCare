package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.constants.VehicleConstants;
import com.fpt.evcare.dto.request.vehicle.CreationVehicleRequest;
import com.fpt.evcare.dto.request.vehicle.UpdationVehicleRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehicleResponse;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.entity.VehicleEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import com.fpt.evcare.exception.ResourceAlreadyExistsException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.VehicleMapper;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.repository.VehicleRepository;
import com.fpt.evcare.repository.VehicleTypeRepository;
import com.fpt.evcare.service.VehicleService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class VehicleServiceImpl implements VehicleService {

    VehicleRepository vehicleRepository;
    VehicleMapper vehicleMapper;
    UserRepository userRepository;
    VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional
    public VehicleResponse getVehicleById(UUID vehicleId) {
        VehicleEntity vehicleEntity = vehicleRepository.findByVehicleIdAndIsDeletedFalse(vehicleId);
        if (vehicleEntity == null) {
            throw new ResourceNotFoundException(VehicleConstants.MESSAGE_ERROR_NOT_FOUND);
        }
        return vehicleMapper.toVehicleResponse(vehicleEntity);
    }

    @Override
    @Transactional
    public PageResponse<VehicleResponse> searchVehicle(String keyword, UUID vehicleTypeId, Pageable pageable) {
        Page<VehicleEntity> vehicleEntityPage;
        
        // Case 1: Cả keyword và vehicleTypeId đều null
        if (keyword == null && vehicleTypeId == null) {
            vehicleEntityPage = vehicleRepository.findAllByIsDeletedFalse(pageable);
        }
        // Case 2: Chỉ có vehicleTypeId, không có keyword
        else if (keyword == null && vehicleTypeId != null) {
            vehicleEntityPage = vehicleRepository.findAllByVehicleType_VehicleTypeIdAndIsDeletedFalse(vehicleTypeId, pageable);
        }
        // Case 3: Chỉ có keyword, không có vehicleTypeId
        else if (keyword != null && vehicleTypeId == null) {
            vehicleEntityPage = vehicleRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }
        // Case 4: Có cả keyword và vehicleTypeId
        else {
            vehicleEntityPage = vehicleRepository.findBySearchContainingIgnoreCaseAndVehicleType_VehicleTypeIdAndIsDeletedFalse(keyword, vehicleTypeId, pageable);
        }
        
        if (vehicleEntityPage.isEmpty()) {
            log.warn(VehicleConstants.MESSAGE_ERR_VEHICLE_NOT_FOUND);
            // Return empty page instead of throwing exception
            return PageResponse.<VehicleResponse>builder()
                    .data(List.of())
                    .page(0)
                    .totalElements(0L)
                    .totalPages(0)
                    .build();
        }

        List<VehicleResponse> vehicleResponseList = vehicleEntityPage.map(vehicleMapper::toVehicleResponse).getContent();

        log.info("Searching vehicles with keyword: {}, vehicleTypeId: {}", keyword, vehicleTypeId);
        return PageResponse.<VehicleResponse>builder()
                .data(vehicleResponseList)
                .page(vehicleEntityPage.getNumber())
                .totalElements(vehicleEntityPage.getTotalElements())
                .totalPages(vehicleEntityPage.getTotalPages())
                .build();
    }

    private String concatenateSearchField(String plateNumber, String vin, String fullName, String email, String phone) {
        return String.join(" ",
                plateNumber != null ? plateNumber.toLowerCase() : "",
                vin != null ? vin.toLowerCase() : "",
                fullName != null ? fullName.toLowerCase() : "",
                email != null ? email.toLowerCase() : "",
                phone != null ? phone.toLowerCase() : ""
        ).trim();
    }

    @Override
    @Transactional
    public VehicleResponse addVehicle(CreationVehicleRequest request) {
        existsPlate(request.getPlateNumber());
        existsVin(request.getVin());

        // Nếu cần, kiểm tra user hoặc logic khác
        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_EXIST));

        VehicleTypeEntity type = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException(VehicleConstants.MESSAGE_ERROR_NOT_FOUND));

        String search = concatenateSearchField(
                request.getPlateNumber(),
                request.getVin(),
                user.getFullName(),
                user.getEmail(),
                request.getPhoneNumber() != null ? request.getPhoneNumber() : user.getNumberPhone()
        );
        VehicleEntity vehicle = new VehicleEntity();
        vehicle.setUser(user);
        vehicle.setVehicleType(type);
        vehicle.setPlateNumber(request.getPlateNumber());
        vehicle.setVin(request.getVin());
        vehicle.setCurrentKm(request.getCurrentKm());
        vehicle.setLastMaintenanceDate(request.getLastMaintenanceDate());
        vehicle.setLastMaintenanceKm(request.getLastMaintenanceKm());
        vehicle.setSearch(search);
        vehicle.setNotes(request.getNotes());
        vehicle.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : user.getNumberPhone());

        return vehicleMapper.toVehicleResponse(vehicleRepository.save(vehicle));
    }
    public boolean existsPlate(String plateNumber) {
        if (vehicleRepository.existsByPlateNumberAndIsDeletedFalse(plateNumber)) {
            throw new ResourceAlreadyExistsException(VehicleConstants.MESSAGE_ERROR_PLATE_NUMBER_EXISTED);
        }
        return false;
    }

    public boolean existsVin(String vin) {
        if (vehicleRepository.existsByPlateNumberAndIsDeletedFalse(vin)) {
            throw new ResourceAlreadyExistsException(VehicleConstants.MESSAGE_ERROR_VIN_EXISTED);
        }
        return false;
    }


    @Override
    @Transactional
    public VehicleResponse updateVehicle(UUID vehicleId, UpdationVehicleRequest vehicleRequest) {
        VehicleEntity vehicleEntity = vehicleRepository.findByVehicleIdAndIsDeletedFalse(vehicleId);
        if (vehicleEntity == null) {
            throw new ResourceNotFoundException(VehicleConstants.MESSAGE_ERROR_NOT_FOUND);
        }

        if (vehicleRequest.getUserId() != null) {
            UserEntity user = userRepository.findById(vehicleRequest.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_EXIST));
            vehicleEntity.setUser(user);
        }

        if (vehicleRequest.getVehicleTypeId() != null) {
            VehicleTypeEntity type = vehicleTypeRepository.findById(vehicleRequest.getVehicleTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException(VehicleConstants.MESSAGE_ERROR_NOT_FOUND));
            vehicleEntity.setVehicleType(type);
        }

        if (vehicleRequest.getPlateNumber() != null &&
                !vehicleRequest.getPlateNumber().equalsIgnoreCase(vehicleEntity.getPlateNumber())) {
            if (vehicleRepository.existsByPlateNumberAndIsDeletedFalse(vehicleRequest.getPlateNumber())) {
                throw new ResourceNotFoundException(VehicleConstants.MESSAGE_ERROR_PLATE_NUMBER_EXISTED);
            }
            vehicleEntity.setPlateNumber(vehicleRequest.getPlateNumber());
        }

        if (vehicleRequest.getVin() != null &&
                !vehicleRequest.getVin().equalsIgnoreCase(vehicleEntity.getVin())) {
            if (vehicleRepository.existsByVinAndIsDeletedFalse(vehicleRequest.getVin())) {
                throw new ResourceNotFoundException(VehicleConstants.MESSAGE_ERROR_VIN_EXISTED);
            }
            vehicleEntity.setVin(vehicleRequest.getVin());
        }

        if (vehicleRequest.getCurrentKm() != null) {
            vehicleEntity.setCurrentKm(vehicleRequest.getCurrentKm());
        }
        if (vehicleRequest.getLastMaintenanceDate() != null) {
            vehicleEntity.setLastMaintenanceDate(vehicleRequest.getLastMaintenanceDate());
        }
        if (vehicleRequest.getLastMaintenanceKm() != null) {
            vehicleEntity.setLastMaintenanceKm(vehicleRequest.getLastMaintenanceKm());
        }
        if (vehicleRequest.getNotes() != null) {
            vehicleEntity.setNotes(vehicleRequest.getNotes());
        }
        if (vehicleRequest.getPhoneNumber() != null) {
            vehicleEntity.setPhoneNumber(vehicleRequest.getPhoneNumber());
        }
        
        // Rebuild search field if any related field changed
        if(vehicleRequest.getPlateNumber() != null || 
           vehicleRequest.getVin() != null || 
           vehicleRequest.getUserId() != null ||
           vehicleRequest.getPhoneNumber() != null){
            String search = concatenateSearchField(
                    vehicleEntity.getPlateNumber(),
                    vehicleEntity.getVin(),
                    vehicleEntity.getUser().getFullName(),
                    vehicleEntity.getUser().getEmail(),
                    vehicleEntity.getPhoneNumber() != null ? vehicleEntity.getPhoneNumber() : vehicleEntity.getUser().getNumberPhone()
            );
            vehicleEntity.setSearch(search);
        }

        VehicleEntity updatedVehicle = vehicleRepository.save(vehicleEntity);
        return vehicleMapper.toVehicleResponse(updatedVehicle);
    }


    @Override
    @Transactional
    public void deleteVehicle(UUID vehicleId) {
        VehicleEntity vehicleEntity = vehicleRepository.findByVehicleIdAndIsDeletedFalse(vehicleId);
        if (vehicleEntity == null) {
            throw new ResourceNotFoundException(VehicleConstants.MESSAGE_ERROR_NOT_FOUND);
        }
        vehicleEntity.setIsDeleted(true);
        vehicleRepository.save(vehicleEntity);
    }

    @Override
    public void restoreVehicle(UUID vehicleId) {
        VehicleEntity vehicleEntity = vehicleRepository.findByVehicleIdAndIsDeletedTrue(vehicleId);
        if (vehicleEntity == null) {
            throw new ResourceNotFoundException(VehicleConstants.MESSAGE_ERROR_NOT_FOUND);
        }
        vehicleEntity.setIsDeleted(false);
        vehicleRepository.save(vehicleEntity);
    }

    @Override
    @Transactional
    public List<VehicleResponse> getVehiclesByUserId(UUID userId) {
        // Kiểm tra user có tồn tại không
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_EXIST));

        List<VehicleEntity> vehicleEntityList = vehicleRepository.findAllByUser_UserIdAndIsDeletedFalse(userId);

        if (vehicleEntityList.isEmpty()) {
            log.warn("No vehicles found for user id: {}", userId);
            return List.of();
        }

        log.info("Found {} vehicles for user id: {}", vehicleEntityList.size(), userId);
        return vehicleEntityList.stream()
                .map(vehicleMapper::toVehicleResponse)
                .toList();
    }


}

