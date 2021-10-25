import http, { IncomingMessage, ServerResponse } from 'http'
import axios from 'axios';
import { Feed } from 'feed';
import moment from 'moment';



const feed = new Feed({
    title: "Osmosis Proposal",
    id: "Osmosis proposals feed via Osmosistaion public api.",
    copyright: "Osmosis gov",
});

const fetchProposals = (async () => {
    const url = 'https://lcd-osmosis.keplr.app/gov/proposals';
    const { data } = await axios.get(url);
    const ooo = data as Response;
    console.dir(ooo);


    ooo.result.sort((a, b) => {
        return (a.id > b.id) ? -1 : 1;
    });

    for (const oo of ooo.result) {
        if (!oo.id) continue;
        feed.addItem({
            title: `VotingEnd: ${moment(oo.voting_end_time).toISOString()} **${oo.content.value.title}`,
            link: `https://wallet.keplr.app/#/osmosis/governance?detailId=${oo.id}`,
            date: moment(oo.submit_time).toDate(),
            description: oo.content.value.description,
            id: oo.id.toString(),
        });

        // console.dir(`proposal_id:${oo.proposal_id}, date:${oo.voting_end_time}`);
    }
    interface Response {
        height: number,
        result: GovProposalResponse[]
    }

    interface GovProposalResponse {
        id: number,
        content: {
            type: string,
            value: {
                title: string,
                description: string
            }
        },
        submit_time: string,
        deposit_end_time: string,
        voting_start_time: string,
        voting_end_time: string,
    }
});
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    await fetchProposals();
    res.writeHead(200, { 'Content-Type': 'application/atom+xml' });
    res.end(feed.atom1());
})

server.listen(4000) // 4000番ポートで起動
