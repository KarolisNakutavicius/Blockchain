// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.8;

contract RentContract
{
    struct House 
    {
        int256 id;
        string _address;
        uint256 _rentCost;
        bool _isRented;
        address payable _ownerAddress;
        address _renterAddress;
        uint256 _rentEndsAt;
    }

    mapping(int256 => House) public Houses;

    int256 public HousesCount;
    
    function AddHouse(string memory houseAddress, uint256 _rentCost) public
    {
        HousesCount++;

        House memory house = House(HousesCount, houseAddress, _rentCost, false, msg.sender, address(0), 0);
        
        Houses[HousesCount] = house;
    }

    function UpdateCost(int256 id, uint256 newCost) public returns (bool)
    {
        if (Houses[id]._ownerAddress != msg.sender || Houses[id]._isRented)
        {
            return false;
        }

        Houses[id]._rentCost = newCost;

        return true;
    }

    function RemoveHouse(int256 id) public returns (bool)
    {
        if (Houses[id]._ownerAddress != msg.sender || Houses[id]._isRented)
        {
            return false;
        }

        delete Houses[id];

        return true;
    }
    
    function RentFrom(int256 id) public payable
    {
        House memory houseToRent = Houses[id];
        
        if (houseToRent._renterAddress != address(0))
        {
            return;
        }
        
        //payment
        houseToRent._ownerAddress.transfer(houseToRent._rentCost * 10**18);
        
        houseToRent._renterAddress = msg.sender;
        
        houseToRent._isRented = true;

        houseToRent._rentEndsAt = block.timestamp + (4 * 7 days);       
    }
}