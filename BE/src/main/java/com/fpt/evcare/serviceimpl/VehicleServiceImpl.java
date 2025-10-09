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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public PageResponse<VehicleResponse> searchVehicle(String keyword, Pageable pageable) {
        return null;
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

        VehicleEntity vehicle = new VehicleEntity();
        vehicle.setUser(user);
        vehicle.setVehicleType(type);
        vehicle.setPlateNumber(request.getPlateNumber());
        vehicle.setVin(request.getVin());
        vehicle.setCurrentKm(request.getCurrentKm());
        vehicle.setLastMaintenanceDate(request.getLastMaintenanceDate());
        vehicle.setLastMaintenanceKm(request.getLastMaintenanceKm());
        vehicle.setNotes(request.getNotes());

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

        vehicleEntity.setSearch(
                (vehicleEntity.getPlateNumber() + " " + vehicleEntity.getVin() + " " + vehicleEntity.getUser().getFullName()).toLowerCase()
        );

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


}
