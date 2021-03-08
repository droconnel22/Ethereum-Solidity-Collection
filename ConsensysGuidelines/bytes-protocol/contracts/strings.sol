// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


library Strings {

    function concat(string memory _base, string memory _values) public pure returns (string memory) {
        bytes memory _myBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_values);

        string memory _tmp = new string(_myBytes.length + _valueBytes.length);
        bytes memory _newValue = bytes(_tmp);

        uint i;
        uint j;

        for(i = 0; i < _myBytes.length;i++) {
            _newValue[j++] = _myBytes[i];
        }

        for(i = 0; i < _valueBytes.length;i++) {
            _newValue[j++] = _valueBytes[i];
        }
         
        return string(_newValue);
    }

    function strpos(string memory _base, string memory _value) public pure returns (int) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        assert(_valueBytes.length == 1);

        for(uint i = 0; i < _baseBytes.length; i++) {
            if(_baseBytes[i] == _valueBytes[0]) {
                return int(i);
            }
        }

        return -1;
    }
}

contract TestString  {
    using Strings for string;

    function testConcat(string memory _base) public pure returns (string memory) {
        return _base.concat("_suffix");
    }

    function needleInHaystack(string memory _base) public pure returns (int) {
        return _base.strpos("t");
    }
}

