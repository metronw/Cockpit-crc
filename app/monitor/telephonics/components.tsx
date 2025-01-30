'use client'

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@nextui-org/react";
import { useRealTimeContext, Channel, Call, Agent } from "./provider";
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

/* ==========================================================
   -- COMEÇO: CÓDIGO DAS TABELAS DE CHAMADAS (SEM ALTERAÇÕES) --
   ========================================================== */

const waitingCallColumns = [
  {
    key: 'company',
    label: 'Empresa'
  },
  {
    key: 'callerId',
    label: 'ID do Chamador'
  },
  {
    key: 'duration',
    label: 'TME'
  },
  {
    key: 'callid',
    label: 'Call ID'
  }
];

const connectedCallColumns = [
  {
    key: 'company',
    label: 'Empresa'
  },
  {
    key: 'callerId',
    label: 'ID do Chamador'
  },
  {
    key: 'holdTime',
    label: 'TME (seg)'
  },
  {
    key: 'user',
    label: 'Nome do Usuário'
  },
  {
    key: 'duration',
    label: 'TMA'
  },
  {
    key: 'callid',
    label: 'Call ID'
  }
];

function calculateDuration(startTime: string) {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const diff = now - start;

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
  const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function mapCallerId(activeChannels: Channel[]) {
  const callerIdMap: { [key: string]: string } = {};
  activeChannels.forEach((channel: Channel) => {
    callerIdMap[channel.uniqueid] = channel.calleridnum;
  });
  return callerIdMap;
}

export function WaitingCallsTable() {
  const { waitingCalls, error, activeChannels } = useRealTimeContext();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (error && !hasError) {
      toast.error('Erro ao carregar dados: ' + error.message);
      setHasError(true);
    }
  }, [error, hasError]);

  const callerIdMap = mapCallerId(activeChannels);

  return (
    <Table aria-label="Chamadas Aguardando" classNames={{ wrapper: 'overflow-auto' }}>
      <TableHeader columns={waitingCallColumns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={waitingCalls}>
        {(item) => (
          <TableRow key={item.callid}>
            {(columnKey) => (
              <TableCell key={item.callid + columnKey.toString()}>
                {columnKey === 'duration'
                  ? calculateDuration(item.time)
                  : columnKey === 'callerId'
                    ? callerIdMap[item.callid.toString()]
                    : columnKey === 'company'
                      ? item.company?.fantasy_name
                      : columnKey === 'user'
                        ? item.user?.name || 'N/A'
                        : String((item as Call)[columnKey as keyof Call])}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function ConnectedCallsTable() {
  const { connectedCalls, error, activeChannels } = useRealTimeContext();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (error && !hasError) {
      toast.error('Erro ao carregar dados: ' + error.message);
      setHasError(true);
    }
  }, [error, hasError]);

  const callerIdMap = mapCallerId(activeChannels);

  return (
    <Table aria-label="Chamadas em Atendimento" classNames={{ wrapper: 'overflow-auto' }}>
      <TableHeader columns={connectedCallColumns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={connectedCalls}>
        {(item) => (
          <TableRow key={item.callid}>
            {(columnKey) => (
              <TableCell key={item.callid + columnKey.toString()}>
                {columnKey === 'duration'
                  ? calculateDuration(item.time)
                  : columnKey === 'callerId'
                    ? callerIdMap[item.callid]
                    : columnKey === 'user'
                      ? item.user?.name || 'N/A'
                      : columnKey === 'company'
                        ? item.company.fantasy_name
                        : String(item[columnKey as keyof Call])}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function RealTimeTables() {
  const { mutate } = useRealTimeContext();
  const [countdown, setCountdown] = useState(45);

  const handleUpdateClick = async () => {
    try {
      await mutate();
      setCountdown(45);
    } catch (error) {
      toast.error('Erro ao atualizar dados: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await mutate();
        setCountdown(45);
      } catch (error) { }
    }, 45000);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 45));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [mutate]);

  return (
    <>
      <div className="flex items-center space-x-4">
        <h1>Chamadas em Tempo Real</h1>
        <Button onClick={handleUpdateClick}>Atualizar Dados</Button>
        <div className="flex items-center space-x-2">
          <span>{countdown}s</span>
        </div>
      </div>
      <h2>Chamadas Aguardando</h2>
      <WaitingCallsTable />
      <h2>Chamadas em Atendimento</h2>
      <ConnectedCallsTable />
      <AgentStatus />
    </>
  );
}

/* ==========================================================
   -- FIM: CÓDIGO DAS TABELAS DE CHAMADAS (SEM ALTERAÇÕES) --
   ========================================================== */


/* ==========================================================
   -- INÍCIO: CORREÇÃO DO SORTEAMENTO E FILTRO NA TABELA DE AGENTES --
   ========================================================== */

const fetcher = (url: string) => fetch(url).then(res => res.json());

const agentColumns = [
  { key: 'agentName', label: 'Agente', sortable: true, filterable: true },
  { key: 'interface', label: 'Ramal', sortable: true, filterable: true },
  { key: 'available', label: 'Disponível?', sortable: true, filterable: true },
  { key: 'pausedSince', label: 'Pausado Desde', sortable: true, filterable: true },
  { key: 'loggedInSince', label: 'Logado Desde', sortable: true, filterable: true },
  { key: 'queues', label: 'Filas', sortable: false, filterable: true },
];

/**
 * `data` é um array de objetos, onde cada objeto corresponde a um agente:
 * 
 * interface Agent {
 *   userId: string | number | null;
 *   agentName: string;
 *   interface: string;
 *   queues: {
 *     name: string;
 *     company_id: number;
 *     company_fantasy_name: string;
 *   }[];
 *   paused: boolean;
 *   inCall: boolean;
 *   available: boolean;
 *   pausedSince: string | null;
 *   loggedInSince: string;
 *   extensionOnline: boolean;
 *   extensionLatency: number | null;
 * }
 */

const calculateDurationFromNow = (time: string | null) => {
  if (!time) return '';
  const start = new Date(time).getTime();
  const now = Date.now();
  const diff = now - start;

  const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
  const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

  if (hours !== '00') {
    return `${parseInt(hours)}h ${minutes}m ${seconds}s`;
  } else if (minutes !== '00') {
    return `${parseInt(minutes)}m ${seconds}s`;
  } else {
    return `${parseInt(seconds)}s`;
  }
};

export function AgentStatus() {
  const [sortKey, setSortKey] = useState<string>('agentName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState<string>('');
  const [showQueues, setShowQueues] = useState(true);

  // Busca SWR para status de agentes
  const { data, error } = useSWR<Agent[]>('/api/phone/agentAvailable', fetcher);

  // Função utilitária para extrair o valor de cada coluna:
  const getAgentValue = useCallback((agent: Agent, key: string) => {
    switch (key) {
      case 'agentName':
        return agent.agentName || '';
      case 'interface':
        return agent.interface || '';
      case 'available':
        // Para comparar de forma consistente, retornamos algo padronizado
        return agent.inCall ? 'Em chamada' : (agent.paused ? 'Pausa' : (agent.available ? 'Sim' : 'Não'));
      case 'pausedSince':
        return agent.pausedSince || '';
      case 'loggedInSince':
        return agent.loggedInSince || '';
      case 'queues':
        // string com todas as filas
        if (!agent.queues) return '';
        return agent.queues.map(q => q.company_fantasy_name).join(', ');
      default:
        return '';
    }
  }, []);

  // 1. FILTRO + 2. SORTEAMENTO
  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];

    // 1. Aplica filtro (se filterText não estiver vazio)
    let tempData = data;
    if (filterText.trim()) {
      const lowerFilter = filterText.toLowerCase();
      tempData = tempData.filter(agent => {
        return agentColumns.some(column => {
          if (!column.filterable) return false;
          const val = getAgentValue(agent, column.key).toString().toLowerCase();
          return val.includes(lowerFilter);
        });
      });
    }

    // 2. Aplica sorteamento (se sortKey for válido)
    const currentColumn = agentColumns.find(col => col.key === sortKey);
    if (currentColumn && currentColumn.sortable) {
      tempData = [...tempData].sort((a, b) => {
        let valA: string | number = getAgentValue(a, sortKey);
        let valB: string | number = getAgentValue(b, sortKey);

        // Se for data/hora (pausedSince, loggedInSince)
        if (sortKey === 'pausedSince' || sortKey === 'loggedInSince') {
          const cellA = document.querySelector(`td[data-iso="${valA}"]`);
          const cellB = document.querySelector(`td[data-iso="${valB}"]`);
          valA = cellA ? cellA.getAttribute('data-iso') || '' : '';
          valB = cellB ? cellB.getAttribute('data-iso') || '' : '';
        }

        // Se for string normaliza minúsculo para comparar
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return tempData;
  }, [data, filterText, sortKey, sortOrder, getAgentValue]);

  // Lida com erro do SWR
  if (error) {
    return <div className="mt-4">Erro ao carregar status dos agentes.</div>;
  }
  if (!data) {
    return <div className="mt-4">Carregando status dos agentes...</div>;
  }

  // Função para lidar com clique no cabeçalho (para reordenar)
  const handleColumnClick = (columnKey: string, isSortable: boolean) => {
    if (!isSortable) return;
    if (sortKey === columnKey) {
      // Troca entre 'asc' e 'desc'
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Define nova coluna de ordenação
      setSortKey(columnKey);
      setSortOrder('asc');
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Status dos Agentes</h2>
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showQueues}
            onChange={() => setShowQueues(prev => !prev)}
            className="mr-2"
          />
          Mostrar Filas
        </label>
        <input
          type="text"
          placeholder="Filtrar Agentes..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="p-2 border rounded mb-2"
        />
      </div>

      <Table aria-label="Status dos Agentes" classNames={{ wrapper: 'overflow-auto' }}>
        <TableHeader columns={agentColumns.filter(column => showQueues || column.key !== 'queues')}>
          {(column) => (
            <TableColumn
              key={column.key}
              onClick={() => handleColumnClick(column.key, column.sortable)}
              // Exibe um indicador simples de ordenação caso seja a coluna atual
              className="cursor-pointer select-none"
            >
              {column.label}
              {sortKey === column.key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={filteredAndSortedData}>
          {(agent) => {
            // Determina classe do TableRow dinamicamente
            const rowClass = !agent.extensionOnline
              ? 'text-danger'
              : (agent.inCall
                ? 'text-success'
                : (agent.paused
                  ? 'text-warning'
                  : ''));

            return (
              <TableRow key={agent.interface} className={rowClass}>
                {(columnKey) => {
                  // Se o usuário optou por não mostrar filas, exibe traço
                  if (columnKey === 'queues' && !showQueues) {
                    return <TableCell>—</TableCell>;
                  }

                  switch (columnKey) {
                    case 'interface':
                      return (
                        <TableCell>
                          {agent.interface}
                          <br />
                          {agent.extensionOnline ? 'ON' : 'OFF'}{' '}
                          {agent.extensionLatency !== null ? `${agent.extensionLatency}ms` : '—'}
                        </TableCell>
                      );
                    case 'available':
                      // Exibe status composto
                      return (
                        <TableCell>
                          {agent.inCall ? 'Em chamada' : (agent.paused ? "Pausa" : (agent.available ? 'Sim' : 'Não'))}
                        </TableCell>
                      );
                    case 'queues':
                      // Exibir todas as filas em que o agente está, separadas por vírgula
                      const queueNames = Array.from(
                        new Set(agent.queues?.map((q: any) => q.company_fantasy_name))
                      ).sort().join(', ') || '—';
                      return <TableCell className="text-sm">{queueNames}</TableCell>;
                    case 'pausedSince':
                    case 'loggedInSince':
                      const time = agent[columnKey as keyof Agent] as string | null;
                      if (!time) {
                        return <TableCell data-iso="">—</TableCell>;
                      }
                      const date = new Date(time);
                      const localTime = date.toLocaleString(undefined, {
                        hour12: false
                      });
                      const duration = calculateDurationFromNow(time);
                      return (
                        <TableCell data-iso={time}>
                          {localTime}
                          <br />
                          {duration}
                        </TableCell>
                      );
                    default:
                      // 'agentName' ou outro campo genérico
                      const value = (agent as any)[columnKey] || '—';
                      return <TableCell>{value}</TableCell>;
                  }
                }}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
}
