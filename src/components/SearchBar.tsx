"use client";

import React, { useCallback, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subneddit } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";

type Props = {};

const SearchBar = (props: Props) => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);

      return data as (Subneddit & {
        _count: Prisma.SubnedditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const request = debounce(() => {
    refetch();
  }, 300);
  const debounceRequest = useCallback(() => {
    request();
  }, [request]);
  return (
    <Command className="relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
        className="outline-nonr border-none focus:border-none focus:outline-none ring-0"
        placeholder="search community..."
      />
      {input.length > 0 ? (
        <CommandList className="absolute bg-white top-full insert-x-0 shadow rounded-b-md">
          {isFetched && (
            <CommandEmpty className="p-4">No results found.</CommandEmpty>
          )}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup className="px-2" heading="Communities">
              {queryResults?.map((subneddit) => (
                <CommandItem
                  className="p-4"
                  key={subneddit.id}
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                  value={subneddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subneddit.name}`}>r/{subneddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default SearchBar;
