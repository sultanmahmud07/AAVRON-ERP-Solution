import { CiSearch } from "react-icons/ci";
import React, { ChangeEvent } from "react";

type SearchBarProps = {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
};

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative bg-white rounded-2xl py-[0.4rem] overflow-hidden">
      <input
        type="text"
        placeholder="Search..."
        className="px-3 py-2 pl-12 text-[#94A3B8] w-full sm:w-64 outline-none"
        value={searchTerm}
        onChange={handleChange}
      />
      <span className="absolute left-5 top-[0.9rem] text-[#2B2B2B]">
        <CiSearch size={25} />
      </span>
    </div>
  );
};

export default SearchBar;