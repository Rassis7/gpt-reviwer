# GPT.ia REVIEWER

### Summary
The code changes introduce new files related to handling links, including hook functions and localization for the list of links.

#### Files
- ListLinks.i18n.ts
- useLinks.ts

## CODE
```diff
# ListLinks.i18n.ts

import { MessagesTypes } from "@/modules/shared/translation/models";

export const locales: MessagesTypes = {
  "pt-BR": {
    title: "Meus links",
    thread: {
      shortLink: "Link encurtado",
      redirectTo: "Redireciona para",
      active: "Ativo",
      expiresIn: "Expira em",
    },
    tbody: {
      enabled: "SIM",
      disabled: "NÃO",
      olloShortLink: "https://ollo.li/{shortLink}",
      edit: "Editar",
    },
    emptyState: {
      title: "Nenhum link encontrado",
      Subtitle: "Você pode criar um novo link clicando",
      link: "aqui",
    },
  },
  "en-US": {},
};

---
# useLinks.ts

import { useEffect } from "react";
import { atom, useAtom } from "jotai";

import { useFetch } from "@/modules/shared/application/http/hooks";
import {
  API_ROUTES,
  FetchErrorResponse,
  FetchResponse,
} from "@/modules/shared/application/http/types";
import { useQuery } from "@tanstack/react-query";

import { Link } from "../types/links.types";

export const UseLinksResponse = {
  links: Link[],
  isFetchingLinks: boolean,
  isFetchedLinks: boolean,
};

export const linksAtom = atom([] as Link[]);

export const useLinks = (): UseLinksResponse => {
  const { asyncFetch } = useFetch();

  const [links, setLinks] = useAtom(linksAtom);

  const {
    data: linksResponse,
    isLoading,
    isFetched,
    isSuccess,
  } = useQuery({
    queryKey: ["allLinks"],
    queryFn: async () =>
      asyncFetch({
        endpoint: API_ROUTES.GET_ALL_LINKS,
        method: "GET",
      }),
  });

  useEffect(() => {
    if (isFetched && isSuccess && linksResponse.data?.length) {
      setLinks(linksResponse.data);
    }
  }, [isFetched, isSuccess, linksResponse?.data, setLinks]);

  return {
    links,
    isFetchingLinks: isLoading,
    isFetchedLinks: isFetched,
  };
};
```

### Final considerations
The code additions seem well-structured and align with the expected functionalities for handling links and localization. No issues found in the provided modifications.

## GRADE: 95


