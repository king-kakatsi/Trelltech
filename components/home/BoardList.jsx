import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Board from './Board';


const BoardList = ({ boards = [] }) => {
    return (
        <View className="mt-1 pl-12">
          {boards.map((b, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center gap-3"
            >
              {/* <Table size={18} color="#6B778C" /> */}
              {/* <Text className=" text-sm">{b}</Text> */}
              <Board id={b}  />
            </TouchableOpacity>
          ))}
        </View>
    );
};

export default BoardList;