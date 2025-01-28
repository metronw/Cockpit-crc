'use client'

import { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@nextui-org/react";
import { useRealTimeContext, Channel, Call } from "./provider";
import { toast } from 'react-hot-toast';

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
                {columnKey === 'duration' ? calculateDuration(item.time) : columnKey === 'callerId' ? callerIdMap[item.callid] : columnKey === 'company' ? item.company.fantasy_name : columnKey === 'user' ? item.user?.name || 'N/A' : String((item as Call)[columnKey as keyof Call])}
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
                {columnKey === 'duration' ? calculateDuration(item.time) : columnKey === 'callerId' ? callerIdMap[item.callid] : columnKey === 'user' ? item.user?.name || 'N/A' : columnKey === 'company' ? item.company.fantasy_name : String(item[columnKey as keyof Call])}
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
      } catch (error) {
      }
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
    </>
  );
}
