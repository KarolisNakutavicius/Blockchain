// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.8;

contract RentContract
{
    struct House 
    {
        int256 id;
        string houseAddress;
        uint256 rentCost;
        address payable ownerAddress;
        address renterAddress;
        uint256 rentEndsAt;
    }

    mapping(int256 => House) public Houses;

    int256 public HousesCount;

    function GetHouseAddress(int256 id) public view returns (string memory)
    {
        return Houses[id].houseAddress;
    }

    function GetRentCost(int256 id) public view returns (int)
    {
        return int(Houses[id].rentCost);
    }

    
    function AddHouse(string memory houseAddress, uint256 rentCost) public
    {
        HousesCount++;

        House memory house = House(HousesCount, houseAddress, rentCost, msg.sender, address(0), 0);
        
        Houses[HousesCount] = house;
    }

    function UpdateCost(int256 id, uint256 newCost) public returns (bool)
    {
        if (Houses[id].ownerAddress != msg.sender || Houses[id].rentEndsAt > block.timestamp)
        {
            return false;
        }

        Houses[id].rentCost = newCost;

        return true;
    }

    function RemoveHouse(int256 id) public returns (bool)
    {
        if (Houses[id].ownerAddress != msg.sender || Houses[id].rentEndsAt > block.timestamp)
        {
            return false;
        }

        delete Houses[id];

        return true;
    }
    
    function RentFrom(int256 id) public payable
    {
        House memory houseToRent = Houses[id];
        
        if (Houses[id].rentEndsAt > block.timestamp || Houses[id].renterAddress == msg.sender)
        {
            return;
        }       

        houseToRent.ownerAddress.transfer(houseToRent.rentCost * 10**18);
        
        Houses[id].renterAddress = msg.sender;
        
        Houses[id].rentEndsAt = now + (4 * 1 weeks);
    }

    function AvailableHouses() public view returns(int256[] memory) 
    {
        uint256 resultCount;

        for (int i = 1; i <= HousesCount; i++)
        {
            if (Houses[i].ownerAddress != msg.sender && Houses[i].rentEndsAt < block.timestamp) {
                resultCount++;
            }
        }

        int256[] memory result = new int256[](resultCount);
        uint256 j;

        for (int i = 1; i <= HousesCount; i++) 
        {
            if (Houses[i].ownerAddress != msg.sender && Houses[i].rentEndsAt < block.timestamp) {
                result[j] = Houses[i].id;
                j++;
            }
        }
        return result; 
    }

    function GetOwnedHouses() public view returns(int256[] memory) 
    {
        uint256 resultCount;

        for (int i = 1; i <= HousesCount; i++)
        {
            if (Houses[i].ownerAddress == msg.sender) {
                resultCount++;
            }
        }

        int256[] memory result = new int256[](resultCount);
        uint256 j;

        for (int i = 1; i <= HousesCount; i++) 
        {
            if (Houses[i].ownerAddress == msg.sender) {
                result[j] = Houses[i].id;
                j++;
            }
        }
        return result; 
    }

    function GetRentedHouses() public view returns(int256[] memory) 
    {
        uint256 resultCount;

        for (int i = 1; i <= HousesCount; i++)
        {
            if (Houses[i].renterAddress == msg.sender && Houses[i].rentEndsAt > block.timestamp) {
                resultCount++;
            }
        }

        int256[] memory result = new int256[](resultCount);
        uint256 j;

        for (int i = 1; i <= HousesCount; i++) 
        {
            if (Houses[i].renterAddress == msg.sender && Houses[i].rentEndsAt > block.timestamp) {
                result[j] = Houses[i].id;
                j++;
            }
        }
        return result; 
    }
}