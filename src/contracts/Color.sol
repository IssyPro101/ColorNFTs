// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "base64-sol/base64.sol";


contract Color is ERC721URIStorage, Ownable {

  struct ColorData {
    string color;
    address owner;
    string dateCreated;
  }

  uint256 public tokenCounter;
  event CreatedSVGNFT(uint256 indexed tokenId, string tokenURI);


  ColorData[] public colors;
  mapping(string => bool) _colorExists;

  constructor() ERC721("Color Code", "CLR")
  {
      tokenCounter = 0;
  }

  function create(string memory svg, string memory _color, string memory _date) public {
      require(!_colorExists[_color]);
      ColorData memory newColor = ColorData(_color, msg.sender, _date);
      colors.push(newColor);
      _safeMint(msg.sender, tokenCounter);
      _colorExists[_color] = true;
      string memory imageURI = svgToImageURI(svg);
      _setTokenURI(tokenCounter, formatTokenURI(imageURI, _color));
      tokenCounter = tokenCounter + 1;
      emit CreatedSVGNFT(tokenCounter, svg);
  }
  // You could also just upload the raw SVG and have solildity convert it!
  function svgToImageURI(string memory svg) public pure returns (string memory) {
      // example:
      // <svg width='500' height='500' viewBox='0 0 285 350' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill='black' d='M150,0,L75,200,L225,200,Z'></path></svg>
      // data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNTAwJyBoZWlnaHQ9JzUwMCcgdmlld0JveD0nMCAwIDI4NSAzNTAnIGZpbGw9J25vbmUnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZmlsbD0nYmxhY2snIGQ9J00xNTAsMCxMNzUsMjAwLEwyMjUsMjAwLFonPjwvcGF0aD48L3N2Zz4=
      string memory baseURL = "data:image/svg+xml;base64,";
      string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
      return string(abi.encodePacked(baseURL,svgBase64Encoded));
  }

  function formatTokenURI(string memory imageURI, string memory _color) public pure returns (string memory) {
      return string(
              abi.encodePacked(
                  "data:application/json;base64,",
                  Base64.encode(
                      bytes(
                          abi.encodePacked(
                              '{"name":"',
                              _color, // You can add whatever name here
                              '", "description":"Color Code is a collection of 16,777,216 unique 1/1 NFTs that live on the Ethereum Blockchain. They represent standard hex color code #RRGGBB notation, there are 256^3 color combinations available. Each color value RR, GG, BB can contain 256 different values, ranging from 00 to FF.", "attributes":"", "image":"',imageURI,'"}'
                          )
                      )
                  )
              )
          );
  }
}
